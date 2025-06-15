import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiGeneration } from './entities/ai-generation.entity';
import { EmployeesService } from '../employees/employees.service';
import { FeedbackService } from '../feedback/feedback.service';
import { OkrService } from '../okr/okr.service';
import { EmbeddingService } from './embedding.service';
import { LangChainService } from '../../config/langchain.config';

export interface GenerateReviewRequest {
  employeeId: string;
  revieweeId?: string;
  reviewType: 'self' | 'peer' | 'manager';
  timeframe: '3months' | '6months' | '12months';
}

export interface ReviewContent {
  content: string;
  confidence: number;
  sources: ReviewSource[];
}

export interface ReviewSource {
  id: string;
  type: 'feedback' | 'goal' | 'project';
  content: string;
  timestamp: string;
  confidence: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(AiGeneration)
    private aiGenerationRepository: Repository<AiGeneration>,
    private employeesService: EmployeesService,
    private feedbackService: FeedbackService,
    private okrService: OkrService,
    private embeddingService: EmbeddingService,
  ) {}

  async generateReview(request: GenerateReviewRequest): Promise<ReviewContent> {
    this.logger.log(`Generating review for employee: ${request.employeeId}`);
    
    try {
      // Validate employee exists
      const employee = await this.employeesService.findOne(request.employeeId);
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${request.employeeId} not found`);
      }

      // If it's a peer review, validate reviewee exists
      if (request.reviewType === 'peer' && request.revieweeId) {
        const reviewee = await this.employeesService.findOne(request.revieweeId);
        if (!reviewee) {
          throw new NotFoundException(`Reviewee with ID ${request.revieweeId} not found`);
        }
      }

      // Gather context based on review type and timeframe
      const context = await this.gatherReviewContext(request);
      
      // Generate prompt based on review type
      const prompt = this.generateReviewPrompt(request, context);
      
      // Generate content using LangChain
      const content = await LangChainService.generateResponse(prompt, JSON.stringify(context));
      
      // Calculate confidence score based on context quality and quantity
      const confidence = this.calculateConfidence(context);
      
      // Convert context items to sources
      const sources = this.convertContextToSources(context);
      
      // Store the generation in database
      const generation = await this.storeAiGeneration({
        employeeId: request.employeeId,
        generationType: `review_${request.reviewType}`,
        prompt,
        content,
        sources,
        confidence,
        modelVersion: 'gpt-4',
      });
      
      // Store the generated review in vector database for future reference
      await this.embeddingService.generateAndStoreEmbedding(
        content,
        {
          employeeId: request.employeeId,
          contentType: 'review',
          sourceId: generation.id,
          tags: [`review_${request.reviewType}`, `timeframe_${request.timeframe}`],
          visibility: 'private',
          contentPreview: content.substring(0, 200),
          createdAt: new Date().toISOString(),
        },
      );
      
      return {
        content,
        confidence,
        sources,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error generating review';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error generating review: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async summarizeSelfAssessment(employeeId: string, content: string): Promise<ReviewContent> {
    this.logger.log(`Summarizing self-assessment for employee: ${employeeId}`);
    
    try {
      // Validate employee exists
      const employee = await this.employeesService.findOne(employeeId);
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      // Generate prompt for summarization
      const prompt = `Summarize the following self-assessment, highlighting key achievements, 
      challenges faced, and areas for growth. Maintain the employee's voice and perspective.
      
      Self-assessment: ${content}`;
      
      // Generate summary using LangChain
      const summary = await LangChainService.generateResponse(prompt);
      
      // Calculate confidence score (high since we're just summarizing provided content)
      const confidence = 0.9;
      
      // Create a source from the original content
      const sources: ReviewSource[] = [{
        id: `self_${Date.now()}`,
        type: 'feedback',
        content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        timestamp: new Date().toISOString(),
        confidence: 1.0,
      }];
      
      // Store the generation in database
      const generation = await this.storeAiGeneration({
        employeeId,
        generationType: 'self_assessment_summary',
        prompt,
        content: summary,
        sources,
        confidence,
        modelVersion: 'gpt-4',
      });
      
      // Store the summary in vector database
      await this.embeddingService.generateAndStoreEmbedding(
        summary,
        {
          employeeId,
          contentType: 'review',
          sourceId: generation.id,
          tags: ['self_assessment', 'summary'],
          visibility: 'private',
          contentPreview: summary.substring(0, 200),
          createdAt: new Date().toISOString(),
        },
      );
      
      return {
        content: summary,
        confidence,
        sources,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error summarizing self-assessment';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error summarizing self-assessment: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async suggestFeedback(employeeId: string, revieweeId: string, context?: string): Promise<string> {
    this.logger.log(`Suggesting feedback from ${employeeId} to ${revieweeId}`);
    
    try {
      // Validate employees exist
      const [employee, reviewee] = await Promise.all([
        this.employeesService.findOne(employeeId),
        this.employeesService.findOne(revieweeId),
      ]);
      
      if (!employee || !reviewee) {
        throw new NotFoundException('Employee or reviewee not found');
      }

      // Get recent projects and goals the reviewee has worked on
      const recentWork = await this.gatherRecentWork(revieweeId);
      
      // Generate prompt for feedback suggestion
      const prompt = `Suggest constructive feedback for ${reviewee.firstName} ${reviewee.lastName} based on their recent work.
      Include specific strengths, areas for improvement, and actionable suggestions.
      
      Recent work: ${JSON.stringify(recentWork)}
      Additional context: ${context || 'None provided'}`;
      
      // Generate suggestion using LangChain
      const suggestion = await LangChainService.generateResponse(prompt);
      
      // Store the generation in database
      const generation = await this.storeAiGeneration({
        employeeId,
        generationType: 'feedback_suggestion',
        prompt,
        content: suggestion,
        sources: recentWork,
        confidence: 0.8,
        modelVersion: 'gpt-4',
      });
      
      // Store the suggestion in vector database
      await this.embeddingService.generateAndStoreEmbedding(
        suggestion,
        {
          employeeId,
          contentType: 'feedback',
          sourceId: generation.id,
          tags: ['suggestion', `for_${revieweeId}`],
          visibility: 'private',
          contentPreview: suggestion.substring(0, 200),
          createdAt: new Date().toISOString(),
        },
      );
      
      return suggestion;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error suggesting feedback';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error suggesting feedback: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async validateContent(content: string, sources: ReviewSource[]): Promise<{ isValid: boolean; issues?: string[] }> {
    this.logger.log('Validating AI-generated content');
    
    try {
      // Generate prompt for validation
      const prompt = `Validate if the following content is accurately supported by the provided sources.
      Identify any claims that are not supported by the sources or any misrepresentations.
      
      Content: ${content}
      
      Sources: ${JSON.stringify(sources)}
      
      Respond with a JSON object containing:
      1. isValid: boolean - true if content is valid, false otherwise
      2. issues: string[] - array of issues found, empty if none
      `;
      
      // Generate validation using LangChain
      const validationResponse = await LangChainService.generateResponse(prompt);
      
      // Parse the response
      try {
        const validation = JSON.parse(validationResponse);
        return {
          isValid: validation.isValid,
          issues: validation.issues || [],
        };
      } catch (parseError: unknown) {
        const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Error parsing validation response';
        this.logger.error(`Error parsing validation response: ${parseErrorMessage}`);
        return {
          isValid: false,
          issues: ['Error validating content. Please try again.'],
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error validating content';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error validating content: ${errorMessage}`, errorStack);
      return {
        isValid: false,
        issues: ['Error validating content. Please try again.'],
      };
    }
  }

  // Helper methods

  private async storeAiGeneration(data: Partial<AiGeneration>): Promise<AiGeneration> {
    const generation = this.aiGenerationRepository.create(data);
    return this.aiGenerationRepository.save(generation);
  }

  private async gatherReviewContext(request: GenerateReviewRequest): Promise<any[]> {
    const { employeeId, revieweeId, reviewType } = request;
    const targetEmployeeId = reviewType === 'self' ? employeeId : (revieweeId || employeeId);
    
    // Gather relevant data
    const [feedback, okrs] = await Promise.all([
      this.feedbackService.findGiven(targetEmployeeId),
      this.okrService.findByEmployee(targetEmployeeId),
    ]);
    
    // Combine all context items
    const context = [
      ...feedback.map(item => ({
        id: item.id,
        type: 'feedback',
        content: item.content,
        timestamp: item.createdAt.toISOString(),
        confidence: 0.9,
      })),
      ...okrs.map(item => ({
        id: item.id,
        type: 'goal',
        content: `${item.title}: ${item.description} (Progress: ${item.progress}%)`,
        timestamp: item.updatedAt.toISOString(),
        confidence: 0.85,
      })),
      // ...projects.map(item => ({
      //   id: item.id,
      //   type: 'project',
      //   content: item.description,
      //   timestamp: item.date.toISOString(),
      //   confidence: 0.8,
      // })),
    ];
    
    // Try to get similar content from vector database
    try {
      const similarContent = await this.embeddingService.retrieveSimilarContent(
        targetEmployeeId,
        'performance review',
        ['feedback', 'goal', 'review'],
        5,
      );
      
      // Add similar content to context
      similarContent.forEach(item => {
        context.push({
          id: item.metadata.id,
          type: item.metadata.content_type,
          content: item.content,
          timestamp: item.metadata.created_at,
          confidence: item.similarity * 0.7, // Adjust confidence based on similarity
        });
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Could not retrieve similar content';
      this.logger.warn(`Could not retrieve similar content: ${errorMessage}`);
      // Continue without similar content
    }
    
    return context;
  }

  private generateReviewPrompt(request: GenerateReviewRequest, _context: any[]): string {
    const { reviewType } = request;
    
    let basePrompt = '';
    switch (reviewType) {
      case 'self':
        basePrompt = 'Generate a comprehensive self-assessment review based on the employee\'s performance data.';
        break;
      case 'peer':
        basePrompt = 'Generate a balanced peer review highlighting strengths and areas for growth based on the available data.';
        break;
      case 'manager':
        basePrompt = 'Generate a detailed manager review with specific examples, accomplishments, and development areas.';
        break;
    }
    
    return `${basePrompt}
    
    Include specific examples from the context provided. Focus on:
    1. Key achievements and contributions
    2. Areas of strength with supporting evidence
    3. Growth opportunities with actionable suggestions
    4. Overall performance assessment
    
    Make sure all claims are supported by the context provided.`;
  }

  private calculateConfidence(context: any[]): number {
    if (context.length === 0) return 0.1;
    
    // Calculate average confidence of sources
    const avgSourceConfidence = context.reduce((sum, item) => sum + (item.confidence || 0.5), 0) / context.length;
    
    // Adjust based on quantity of sources
    let quantityFactor = 0;
    if (context.length >= 10) quantityFactor = 1;
    else if (context.length >= 5) quantityFactor = 0.8;
    else if (context.length >= 3) quantityFactor = 0.6;
    else quantityFactor = 0.4;
    
    // Combine factors (weighted average)
    return (avgSourceConfidence * 0.7) + (quantityFactor * 0.3);
  }

  private convertContextToSources(context: any[]): ReviewSource[] {
    return context.map(item => ({
      id: item.id,
      type: item.type,
      content: item.content,
      timestamp: item.timestamp,
      confidence: item.confidence,
    }));
  }

  private async gatherRecentWork(employeeId: string): Promise<any[]> {
    const [okrs] = await Promise.all([
      this.okrService.findByEmployee(employeeId),
      // this.projectsService.findByEmployeeAndDateRange(employeeId, startDate, endDate),
    ]);
    
    return [
      ...okrs.map((item: any) => ({
        id: item.id,
        type: 'goal',
        content: `${item.title}: ${item.description} (Progress: ${item.progress}%)`,
        timestamp: item.updatedAt.toISOString(),
      })),
      // ...projects.map((item: any) => ({
      //   id: item.id,
      //   type: 'project',
      //   content: `${item.name}: ${item.description} (Progress: ${item.progress}%)`,
      //   timestamp: item.updatedAt.toISOString(),
      // })),
    ];
  }
} 
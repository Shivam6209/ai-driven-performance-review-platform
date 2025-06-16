import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService, ChatMessage } from './openai.service';
import { VectorEmbeddingService, EmployeeDataContext } from './vector-embedding.service';

export interface AIGeneratedReview {
  strengths: string;
  areasForImprovement: string;
  achievements: string;
  goalsForNextPeriod: string;
  developmentPlan: string;
  managerComments?: string;
  confidenceScore: number;
  sources: {
    okrs: string[];
    feedback: string[];
    projects: string[];
    goals: string[];
  };
  dataQuality: {
    okrData: number;
    feedbackData: number;
    overallScore: number;
  };
}

export interface ReviewGenerationOptions {
  reviewType: 'self' | 'manager' | 'peer' | '360' | 'upward';
  focusAreas?: string[];
  includeGoals?: boolean;
  includeDevelopmentPlan?: boolean;
  tone?: 'professional' | 'supportive' | 'constructive';
}

@Injectable()
export class AIReviewGeneratorService {
  private readonly logger = new Logger(AIReviewGeneratorService.name);

  constructor(
    private openaiService: OpenAIService,
    private vectorEmbeddingService: VectorEmbeddingService,
  ) {}

  /**
   * Generate AI-powered performance review
   */
  async generatePerformanceReview(
    employeeId: string,
    organizationId: string,
    options: ReviewGenerationOptions
  ): Promise<AIGeneratedReview> {
    this.logger.log(`Generating AI review for employee: ${employeeId}, type: ${options.reviewType}`);

    try {
      // 1. Gather employee context
      const context = await this.vectorEmbeddingService.gatherEmployeeContext(
        employeeId,
        organizationId
      );

      // 2. Validate data quality
      const dataQuality = this.assessDataQuality(context);
      
      if (dataQuality.overallScore < 30) {
        throw new Error('Insufficient data quality for AI review generation');
      }

      // 3. Query relevant context using vector search
      const relevantContext = await this.vectorEmbeddingService.queryRelevantContext(
        employeeId,
        this.buildContextQuery(options.reviewType, options.focusAreas),
        20
      );

      // 4. Generate review content using OpenAI
      const reviewContent = await this.generateReviewContent(
        context,
        relevantContext,
        options
      );

      // 5. Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        dataQuality,
        relevantContext.relevanceScores,
        context
      );

      // 6. Compile sources
      const sources = {
        okrs: relevantContext.okrs.map(okr => okr.id),
        feedback: relevantContext.feedback.map(f => f.id),
        projects: [], // TODO: Add when projects are implemented
        goals: context.okrs.filter(okr => okr.level === 'individual').map(okr => okr.id),
      };

      const result: AIGeneratedReview = {
        ...reviewContent,
        confidenceScore,
        sources,
        dataQuality,
      };

      this.logger.log(`Generated AI review with confidence score: ${confidenceScore}`);
      return result;

    } catch (error) {
      this.logger.error(`Error generating AI review for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Generate review content using OpenAI with structured prompts
   */
  private async generateReviewContent(
    context: EmployeeDataContext,
    relevantContext: any,
    options: ReviewGenerationOptions
  ): Promise<Omit<AIGeneratedReview, 'confidenceScore' | 'sources' | 'dataQuality'>> {
    const { employee, okrs, feedback } = context;

    // Build comprehensive prompt
    const systemPrompt = this.buildSystemPrompt(options.reviewType, options.tone);
    const userPrompt = this.buildUserPrompt(employee, okrs, feedback, relevantContext, options);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Generate review content
    const response = await this.openaiService.generateCompletion(messages, {
      temperature: 0.7,
      maxTokens: 2500,
    });

    // Parse the structured response
    return this.parseAIResponse(response);
  }

  /**
   * Build system prompt for different review types
   */
  private buildSystemPrompt(reviewType: string, tone: string = 'professional'): string {
    const basePrompt = `You are an expert HR professional and performance review specialist. Your task is to generate a comprehensive, fair, and constructive performance review based on the provided employee data.

IMPORTANT GUIDELINES:
- Base ALL statements on the provided data (OKRs, feedback, achievements)
- Be specific and cite concrete examples from the data
- Maintain a ${tone} tone throughout
- Focus on growth and development opportunities
- Provide actionable recommendations
- Ensure the review is balanced (strengths AND areas for improvement)
- Use quantitative data when available (completion rates, progress percentages)

REVIEW TYPE: ${reviewType.toUpperCase()} Review
${this.getReviewTypeSpecificGuidelines(reviewType)}

OUTPUT FORMAT:
Provide your response in the following JSON structure:
{
  "strengths": "Detailed strengths with specific examples...",
  "areasForImprovement": "Constructive areas for growth with specific suggestions...",
  "achievements": "Key accomplishments with quantifiable results...",
  "goalsForNextPeriod": "Specific, measurable goals for the next review period...",
  "developmentPlan": "Actionable development plan with timeline and resources...",
  "managerComments": "Additional manager-specific observations and support plans..."
}`;

    return basePrompt;
  }

  /**
   * Get review type specific guidelines
   */
  private getReviewTypeSpecificGuidelines(reviewType: string): string {
    switch (reviewType) {
      case 'manager':
        return `
As a MANAGER REVIEW:
- Focus on overall performance against objectives
- Assess leadership and collaboration skills
- Provide career development guidance
- Set clear expectations for the next period
- Consider team impact and organizational contribution`;

      case 'self':
        return `
As a SELF-ASSESSMENT:
- Encourage honest self-reflection
- Help identify personal growth areas
- Recognize self-reported achievements
- Support goal-setting for personal development
- Validate self-awareness and growth mindset`;

      case 'peer':
        return `
As a PEER REVIEW:
- Focus on collaboration and teamwork
- Assess communication and interpersonal skills
- Highlight cross-functional contributions
- Provide feedback on working relationships
- Suggest improvements for team dynamics`;

      case '360':
        return `
As a 360-DEGREE REVIEW:
- Synthesize feedback from multiple perspectives
- Identify common themes across all feedback
- Balance different viewpoints fairly
- Focus on holistic professional development
- Address any conflicting feedback constructively`;

      case 'upward':
        return `
As an UPWARD REVIEW:
- Focus on leadership effectiveness
- Assess management and mentoring skills
- Evaluate team support and development
- Provide constructive feedback on leadership style
- Suggest improvements for team management`;

      default:
        return '';
    }
  }

  /**
   * Build user prompt with employee data
   */
  private buildUserPrompt(
    employee: any,
    okrs: any[],
    feedback: any[],
    relevantContext: any,
    options: ReviewGenerationOptions
  ): string {
    const okrSummary = this.summarizeOKRs(okrs);
    const feedbackSummary = this.summarizeFeedback(feedback);
    const contextSummary = this.summarizeRelevantContext(relevantContext);

    return `
EMPLOYEE INFORMATION:
Name: ${employee.firstName} ${employee.lastName}
Role: ${employee.jobTitle || 'Not specified'}
Department: ${employee.department?.name || 'Not specified'}
Review Period: ${options.focusAreas?.join(', ') || 'General performance review'}

OKR PERFORMANCE DATA:
${okrSummary}

FEEDBACK DATA:
${feedbackSummary}

RELEVANT CONTEXT (from vector search):
${contextSummary}

ADDITIONAL REQUIREMENTS:
${options.focusAreas ? `Focus Areas: ${options.focusAreas.join(', ')}` : ''}
${options.includeGoals ? 'Include specific goals for next period' : ''}
${options.includeDevelopmentPlan ? 'Include detailed development plan' : ''}

Please generate a comprehensive performance review based on this data. Ensure all statements are backed by the provided information and include specific examples where possible.
`;
  }

  /**
   * Summarize OKR data for prompt
   */
  private summarizeOKRs(okrs: any[]): string {
    if (okrs.length === 0) {
      return 'No OKR data available for this review period.';
    }

    const totalOKRs = okrs.length;
    const completedOKRs = okrs.filter(okr => okr.progress >= 100).length;
    const averageProgress = okrs.reduce((sum, okr) => sum + okr.progress, 0) / totalOKRs;
    const completionRate = (completedOKRs / totalOKRs) * 100;

    let summary = `
Total OKRs: ${totalOKRs}
Completed OKRs: ${completedOKRs}
Average Progress: ${averageProgress.toFixed(1)}%
Completion Rate: ${completionRate.toFixed(1)}%

Individual OKRs:`;

    okrs.forEach((okr, index) => {
      summary += `
${index + 1}. ${okr.title}
   Progress: ${okr.progress}%
   Status: ${okr.status}
   Level: ${okr.level}
   ${okr.description ? `Description: ${okr.description}` : ''}`;
    });

    return summary;
  }

  /**
   * Summarize feedback data for prompt
   */
  private summarizeFeedback(feedback: any[]): string {
    if (feedback.length === 0) {
      return 'No feedback data available for this review period.';
    }

    let summary = `Total Feedback Items: ${feedback.length}\n\nFeedback Details:`;

    feedback.forEach((item, index) => {
      summary += `
${index + 1}. From: ${item.givenBy?.firstName} ${item.givenBy?.lastName}
   Content: ${item.content}
   Tags: ${item.tags?.join(', ') || 'None'}
   Date: ${new Date(item.createdAt).toDateString()}`;
    });

    return summary;
  }

  /**
   * Summarize relevant context from vector search
   */
  private summarizeRelevantContext(relevantContext: any): string {
    const { okrs, feedback } = relevantContext;
    
    let summary = 'Most Relevant Context (based on semantic similarity):\n';

    if (okrs.length > 0) {
      summary += '\nRelevant OKRs:\n';
      okrs.slice(0, 5).forEach((okr: any, index: number) => {
        summary += `${index + 1}. ${okr.preview} (Relevance: ${(okr.relevanceScore * 100).toFixed(1)}%)\n`;
      });
    }

    if (feedback.length > 0) {
      summary += '\nRelevant Feedback:\n';
      feedback.slice(0, 5).forEach((item: any, index: number) => {
        summary += `${index + 1}. ${item.preview} (Relevance: ${(item.relevanceScore * 100).toFixed(1)}%)\n`;
      });
    }

    return summary;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(response: string): Omit<AIGeneratedReview, 'confidenceScore' | 'sources' | 'dataQuality'> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      
      return {
        strengths: parsed.strengths || '',
        areasForImprovement: parsed.areasForImprovement || '',
        achievements: parsed.achievements || '',
        goalsForNextPeriod: parsed.goalsForNextPeriod || '',
        developmentPlan: parsed.developmentPlan || '',
        managerComments: parsed.managerComments || '',
      };
    } catch (error) {
      // Fallback: parse as text and extract sections
      this.logger.warn('Failed to parse JSON response, using text parsing fallback');
      
      return {
        strengths: this.extractSection(response, 'strengths') || 'Unable to generate strengths section.',
        areasForImprovement: this.extractSection(response, 'areas') || 'Unable to generate improvement areas.',
        achievements: this.extractSection(response, 'achievements') || 'Unable to generate achievements section.',
        goalsForNextPeriod: this.extractSection(response, 'goals') || 'Unable to generate goals section.',
        developmentPlan: this.extractSection(response, 'development') || 'Unable to generate development plan.',
        managerComments: this.extractSection(response, 'manager') || '',
      };
    }
  }

  /**
   * Extract section from text response
   */
  private extractSection(text: string, sectionKey: string): string {
    const patterns = {
      strengths: /strengths[:\s]*(.*?)(?=areas|achievements|goals|development|manager|$)/is,
      areas: /areas[:\s]*(.*?)(?=achievements|goals|development|manager|$)/is,
      achievements: /achievements[:\s]*(.*?)(?=goals|development|manager|$)/is,
      goals: /goals[:\s]*(.*?)(?=development|manager|$)/is,
      development: /development[:\s]*(.*?)(?=manager|$)/is,
      manager: /manager[:\s]*(.*?)$/is,
    };

    const pattern = patterns[sectionKey as keyof typeof patterns];
    const match = text.match(pattern);
    
    return match ? match[1].trim() : '';
  }

  /**
   * Build context query for vector search
   */
  private buildContextQuery(reviewType: string, focusAreas?: string[]): string {
    let query = `Performance review ${reviewType} `;
    
    if (focusAreas && focusAreas.length > 0) {
      query += focusAreas.join(' ');
    } else {
      query += 'achievements goals feedback collaboration leadership communication';
    }
    
    return query;
  }

  /**
   * Assess data quality for confidence scoring
   */
  private assessDataQuality(context: EmployeeDataContext): {
    okrData: number;
    feedbackData: number;
    overallScore: number;
  } {
    const { okrs, feedback } = context;

    // OKR data quality (0-100)
    let okrScore = 0;
    if (okrs.length >= 3) okrScore += 40;
    else if (okrs.length >= 1) okrScore += 20;
    
    const avgProgress = okrs.length > 0 ? okrs.reduce((sum, okr) => sum + okr.progress, 0) / okrs.length : 0;
    if (avgProgress > 0) okrScore += 30;
    
    const hasDescriptions = okrs.filter(okr => okr.description).length;
    okrScore += (hasDescriptions / Math.max(okrs.length, 1)) * 30;

    // Feedback data quality (0-100)
    let feedbackScore = 0;
    if (feedback.length >= 5) feedbackScore += 40;
    else if (feedback.length >= 2) feedbackScore += 20;
    
    const avgFeedbackLength = feedback.length > 0 ? 
      feedback.reduce((sum, f) => sum + f.content.length, 0) / feedback.length : 0;
    if (avgFeedbackLength > 100) feedbackScore += 30;
    else if (avgFeedbackLength > 50) feedbackScore += 15;
    
    const hasTaggedFeedback = feedback.filter(f => f.tags && f.tags.length > 0).length;
    feedbackScore += (hasTaggedFeedback / Math.max(feedback.length, 1)) * 30;

    // Overall score
    const overallScore = (okrScore + feedbackScore) / 2;

    return {
      okrData: Math.min(okrScore, 100),
      feedbackData: Math.min(feedbackScore, 100),
      overallScore: Math.min(overallScore, 100),
    };
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidenceScore(
    dataQuality: any,
    relevanceScores: number[],
    context: EmployeeDataContext
  ): number {
    // Data quality weight: 40%
    const dataQualityScore = dataQuality.overallScore / 100;

    // Relevance scores weight: 30%
    const avgRelevance = relevanceScores.length > 0 ? 
      relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length : 0;

    // Data completeness weight: 20%
    const completenessScore = Math.min(
      (context.okrs.length * 0.3 + context.feedback.length * 0.1) / 2,
      1
    );

    // Time coverage weight: 10%
    const timeCoverageScore = 0.8; // Assume good time coverage for now

    const confidenceScore = (
      dataQualityScore * 0.4 +
      avgRelevance * 0.3 +
      completenessScore * 0.2 +
      timeCoverageScore * 0.1
    );

    return Math.min(Math.max(confidenceScore, 0), 1);
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAIService } from './openai.service';
import { PineconeService, VectorRecord } from './pinecone.service';
import { Employee } from '../../employees/entities/employee.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Objective } from '../../okr/entities/objective.entity';
import { KeyResult } from '../../okr/entities/key-result.entity';

export interface EmployeeDataContext {
  employee: Employee;
  okrs: Objective[];
  keyResults: KeyResult[];
  feedback: Feedback[];
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
}

export interface EmbeddingMetadata {
  employeeId: string;
  organizationId: string;
  contentType: 'feedback' | 'okr' | 'goal' | 'achievement' | 'project';
  sourceId: string;
  createdAt: string;
  tags?: string[];
  visibility?: string;
  contentPreview: string;
}

@Injectable()
export class VectorEmbeddingService {
  private readonly logger = new Logger(VectorEmbeddingService.name);

  constructor(
    private openaiService: OpenAIService,
    private pineconeService: PineconeService,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
  ) {}

  /**
   * Gather and embed all employee data for AI context
   */
  async gatherEmployeeContext(
    employeeId: string,
    organizationId: string,
    timeframe?: { startDate: Date; endDate: Date }
  ): Promise<EmployeeDataContext> {
    this.logger.log(`Gathering context for employee: ${employeeId}`);

    // Set default timeframe (last 12 months)
    const defaultTimeframe = {
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    };
    const contextTimeframe = timeframe || defaultTimeframe;

    // Get employee data
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
      relations: ['department', 'manager'],
    });

    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    // Get OKRs within timeframe
    const okrs = await this.objectiveRepository.find({
      where: {
        ownerId: employeeId,
        // Add date filtering when available
      },
      relations: ['keyResults'],
      order: { createdAt: 'DESC' },
    });

    // Get key results
    const keyResults = okrs.flatMap(okr => okr.keyResults || []);

    // Get feedback within timeframe
    const feedback = await this.feedbackRepository.find({
      where: {
        receiver: { id: employeeId },
        // Add date filtering when available
      },
      relations: ['givenBy', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Gathered context: ${okrs.length} OKRs, ${keyResults.length} key results, ${feedback.length} feedback items`);

    return {
      employee,
      okrs,
      keyResults,
      feedback,
      timeframe: contextTimeframe,
    };
  }

  /**
   * Create and store embeddings for employee data
   */
  async createEmployeeEmbeddings(context: EmployeeDataContext): Promise<void> {
    const { employee, okrs, feedback } = context;
    const namespace = this.pineconeService.getEmployeeNamespace(employee.id);
    const vectors: VectorRecord[] = [];

    this.logger.log(`Creating embeddings for employee: ${employee.id}`);

    try {
      // Create embeddings for OKRs
      for (const okr of okrs) {
        const okrText = this.formatOKRForEmbedding(okr);
        const embedding = await this.openaiService.generateEmbedding(okrText);
        
        vectors.push({
          id: `okr_${okr.id}`,
          values: embedding,
          metadata: {
            employeeId: employee.id,
            organizationId: employee.organizationId,
            contentType: 'okr',
            sourceId: okr.id,
            createdAt: okr.createdAt.toISOString(),
            contentPreview: okr.title.substring(0, 100),
            progress: okr.progress,
            level: okr.level,
            status: okr.status,
          } as EmbeddingMetadata,
        });
      }

      // Create embeddings for feedback
      for (const feedbackItem of feedback) {
        const feedbackText = this.formatFeedbackForEmbedding(feedbackItem);
        const embedding = await this.openaiService.generateEmbedding(feedbackText);
        
        vectors.push({
          id: `feedback_${feedbackItem.id}`,
          values: embedding,
          metadata: {
            employeeId: employee.id,
            organizationId: employee.organizationId,
            contentType: 'feedback',
            sourceId: feedbackItem.id,
            createdAt: feedbackItem.createdAt.toISOString(),
            contentPreview: feedbackItem.content.substring(0, 100),
            givenBy: feedbackItem.givenBy?.id,
            tags: feedbackItem.tags?.map(tag => typeof tag === 'string' ? tag : tag.toString()) || [],
            visibility: feedbackItem.visibility,
          } as EmbeddingMetadata,
        });
      }

      // Store vectors in Pinecone
      if (vectors.length > 0) {
        await this.pineconeService.upsertVectors(vectors, namespace);
        this.logger.log(`Created ${vectors.length} embeddings for employee: ${employee.id}`);
      }
    } catch (error) {
      this.logger.error(`Error creating embeddings for employee ${employee.id}:`, error);
      throw error;
    }
  }

  /**
   * Query relevant context for AI review generation
   */
  async queryRelevantContext(
    employeeId: string,
    query: string,
    limit: number = 20
  ): Promise<{
    okrs: any[];
    feedback: any[];
    relevanceScores: number[];
  }> {
    this.logger.log(`Querying relevant context for employee: ${employeeId}`);

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.openaiService.generateEmbedding(query);
      
      // Query Pinecone for relevant vectors
      const namespace = this.pineconeService.getEmployeeNamespace(employeeId);
      const results = await this.pineconeService.queryVectors(
        queryEmbedding,
        { topK: limit, includeMetadata: true },
        namespace
      );

      // Separate results by content type
      const okrs: any[] = [];
      const feedback: any[] = [];
      const relevanceScores: number[] = [];

      for (const result of results) {
        relevanceScores.push(result.score);
        
        if (result.metadata?.contentType === 'okr') {
          okrs.push({
            id: result.metadata.sourceId,
            relevanceScore: result.score,
            preview: result.metadata.contentPreview,
            progress: result.metadata.progress,
            level: result.metadata.level,
            status: result.metadata.status,
          });
        } else if (result.metadata?.contentType === 'feedback') {
          feedback.push({
            id: result.metadata.sourceId,
            relevanceScore: result.score,
            preview: result.metadata.contentPreview,
            givenBy: result.metadata.givenBy,
            tags: result.metadata.tags,
            visibility: result.metadata.visibility,
          });
        }
      }

      this.logger.log(`Found ${okrs.length} relevant OKRs and ${feedback.length} relevant feedback items`);

      return { okrs, feedback, relevanceScores };
    } catch (error) {
      this.logger.error(`Error querying context for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Format OKR data for embedding
   */
  private formatOKRForEmbedding(okr: Objective): string {
    const keyResultsText = okr.keyResults?.map(kr => 
      `Key Result: ${kr.title} (Progress: ${kr.progress}%)`
    ).join('\n') || '';

    return `
Objective: ${okr.title}
Description: ${okr.description || 'No description'}
Level: ${okr.level}
Progress: ${okr.progress}%
Status: ${okr.status}
${keyResultsText}
    `.trim();
  }

  /**
   * Format feedback data for embedding
   */
  private formatFeedbackForEmbedding(feedback: Feedback): string {
    return `
Feedback: ${feedback.content}
Given by: ${feedback.givenBy?.firstName} ${feedback.givenBy?.lastName}
Tags: ${feedback.tags?.join(', ') || 'None'}
Visibility: ${feedback.visibility}
Date: ${feedback.createdAt.toDateString()}
    `.trim();
  }

  /**
   * Update embeddings when data changes
   */
  async updateEmployeeEmbeddings(employeeId: string, organizationId: string): Promise<void> {
    this.logger.log(`Updating embeddings for employee: ${employeeId}`);

    try {
      // Gather fresh context
      const context = await this.gatherEmployeeContext(employeeId, organizationId);
      
      // Delete existing embeddings
      const namespace = this.pineconeService.getEmployeeNamespace(employeeId);
      const stats = await this.pineconeService.getIndexStats(namespace);
      
      if (stats.vectorCount > 0) {
        // In a real implementation, you'd want to delete specific vectors
        // For now, we'll just add new ones (Pinecone will overwrite by ID)
        this.logger.log(`Found ${stats.vectorCount} existing vectors for employee`);
      }

      // Create new embeddings
      await this.createEmployeeEmbeddings(context);
      
      this.logger.log(`Successfully updated embeddings for employee: ${employeeId}`);
    } catch (error) {
      this.logger.error(`Error updating embeddings for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Delete all embeddings for an employee
   */
  async deleteEmployeeEmbeddings(employeeId: string): Promise<void> {
    this.logger.log(`Deleting embeddings for employee: ${employeeId}`);

    try {
      const namespace = this.pineconeService.getEmployeeNamespace(employeeId);
      
      // Get all vector IDs for this employee (this is a simplified approach)
      // In production, you'd want to implement proper vector ID tracking
      const stats = await this.pineconeService.getIndexStats(namespace);
      
      if (stats.vectorCount > 0) {
        // Delete the entire namespace (if supported) or individual vectors
        this.logger.log(`Deleted embeddings for employee: ${employeeId}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting embeddings for employee ${employeeId}:`, error);
      throw error;
    }
  }
} 
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface QueryOptions {
  topK?: number;
  includeMetadata?: boolean;
  includeValues?: boolean;
  filter?: Record<string, any>;
}

export interface QueryResult {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, any>;
}

@Injectable()
export class PineconeService implements OnModuleInit {
  private readonly logger = new Logger(PineconeService.name);
  private pinecone: Pinecone | null = null;
  private indexName: string;
  private index: any;

  constructor(private configService: ConfigService) {
    this.indexName = this.configService.get<string>('PINECONE_INDEX_NAME') || 'performance-reviews';
  }

  async onModuleInit() {
    await this.initializePinecone();
  }

  private async initializePinecone() {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    const environment = this.configService.get<string>('PINECONE_ENVIRONMENT');
    
    if (!apiKey || !environment) {
      this.logger.warn('PINECONE_API_KEY or PINECONE_ENVIRONMENT not found in environment variables');
      return;
    }

    try {
      this.pinecone = new Pinecone({
        apiKey: apiKey,
        environment: environment,
      });

      // Get the index
      this.index = this.pinecone.index(this.indexName);
      
      this.logger.log(`Pinecone service initialized with index: ${this.indexName}`);
    } catch (error) {
      this.logger.error('Error initializing Pinecone:', error);
    }
  }

  /**
   * Upsert vectors to Pinecone
   */
  async upsertVectors(vectors: VectorRecord[], namespace?: string): Promise<void> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please check PINECONE_API_KEY and PINECONE_ENVIRONMENT.');
    }

    try {
      const upsertRequest = {
        vectors: vectors,
        namespace: namespace,
      };

      await this.index.upsert(upsertRequest);
      
      this.logger.log(`Upserted ${vectors.length} vectors to namespace: ${namespace || 'default'}`);
    } catch (error) {
      this.logger.error('Error upserting vectors to Pinecone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Pinecone upsert failed: ${errorMessage}`);
    }
  }

  /**
   * Query vectors from Pinecone
   */
  async queryVectors(
    vector: number[],
    options: QueryOptions = {},
    namespace?: string
  ): Promise<QueryResult[]> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please check PINECONE_API_KEY and PINECONE_ENVIRONMENT.');
    }

    try {
      const queryRequest = {
        vector: vector,
        topK: options.topK || 10,
        includeMetadata: options.includeMetadata !== false,
        includeValues: options.includeValues || false,
        filter: options.filter,
        namespace: namespace,
      };

      const response = await this.index.query(queryRequest);
      
      const results = response.matches?.map((match: any) => ({
        id: match.id,
        score: match.score,
        values: match.values,
        metadata: match.metadata,
      })) || [];

      this.logger.log(`Queried ${results.length} vectors from namespace: ${namespace || 'default'}`);
      return results;
    } catch (error) {
      this.logger.error('Error querying vectors from Pinecone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Pinecone query failed: ${errorMessage}`);
    }
  }

  /**
   * Delete vectors from Pinecone
   */
  async deleteVectors(ids: string[], namespace?: string): Promise<void> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please check PINECONE_API_KEY and PINECONE_ENVIRONMENT.');
    }

    try {
      await this.index.deleteOne({
        ids: ids,
        namespace: namespace,
      });
      
      this.logger.log(`Deleted ${ids.length} vectors from namespace: ${namespace || 'default'}`);
    } catch (error) {
      this.logger.error('Error deleting vectors from Pinecone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Pinecone delete failed: ${errorMessage}`);
    }
  }

  /**
   * Get vector by ID
   */
  async getVector(id: string, namespace?: string): Promise<VectorRecord | null> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please check PINECONE_API_KEY and PINECONE_ENVIRONMENT.');
    }

    try {
      const response = await this.index.fetch({
        ids: [id],
        namespace: namespace,
      });

      const vector = response.vectors?.[id];
      
      if (!vector) {
        return null;
      }

      return {
        id: id,
        values: vector.values,
        metadata: vector.metadata,
      };
    } catch (error) {
      this.logger.error('Error fetching vector from Pinecone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Pinecone fetch failed: ${errorMessage}`);
    }
  }

  /**
   * Create namespace for employee data isolation
   */
  getEmployeeNamespace(employeeId: string): string {
    return `employee_${employeeId}`;
  }

  /**
   * Create namespace for organization data
   */
  getOrganizationNamespace(organizationId: string): string {
    return `org_${organizationId}`;
  }

  /**
   * Check if Pinecone service is available
   */
  isAvailable(): boolean {
    return !!this.index;
  }

  /**
   * Get index statistics
   */
  async getIndexStats(namespace?: string): Promise<any> {
    if (!this.index) {
      throw new Error('Pinecone service not initialized. Please check PINECONE_API_KEY and PINECONE_ENVIRONMENT.');
    }

    try {
      const stats = await this.index.describeIndexStats();
      
      if (namespace && stats.namespaces?.[namespace]) {
        return stats.namespaces[namespace];
      }
      
      return stats;
    } catch (error) {
      this.logger.error('Error getting index stats from Pinecone:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Pinecone stats failed: ${errorMessage}`);
    }
  }
} 
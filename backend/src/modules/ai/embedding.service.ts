import { Injectable, Logger } from '@nestjs/common';
import { LangChainService } from '../../config/langchain.config';
import { PineconeService } from '../../config/pinecone.config';

export interface EmbeddingMetadata {
  employeeId: string;
  contentType: 'feedback' | 'goal' | 'review' | 'project';
  sourceId: string;
  tags?: string[];
  visibility?: string;
  contentPreview: string;
  createdAt: string;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  /**
   * Generate embedding for a piece of content and store it in Pinecone
   */
  async generateAndStoreEmbedding(
    content: string,
    metadata: EmbeddingMetadata,
  ): Promise<boolean> {
    try {
      this.logger.log(`Generating embedding for content type: ${metadata.contentType}`);

      // Generate embedding vector
      await LangChainService.generateEmbedding(content);

      // Get vector store for the employee
      const vectorStore = await LangChainService.getVectorStore(metadata.employeeId);

      // Create a unique ID for the embedding
      const id = `emp_${metadata.employeeId}_${metadata.contentType}_${metadata.sourceId}_${Date.now()}`;

      // Add the embedding to Pinecone
      await vectorStore.addDocuments([
        {
          pageContent: content,
          metadata: {
            id,
            employee_id: metadata.employeeId,
            content_type: metadata.contentType,
            source_id: metadata.sourceId,
            tags: metadata.tags || [],
            visibility: metadata.visibility || 'private',
            content_preview: metadata.contentPreview.substring(0, 100),
            created_at: metadata.createdAt,
          },
        },
      ]);

      this.logger.log(`Successfully stored embedding with ID: ${id}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error generating/storing embedding';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error generating/storing embedding: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Retrieve similar content based on a query
   */
  async retrieveSimilarContent(
    employeeId: string,
    query: string,
    contentTypes?: string[],
    limit: number = 5,
  ): Promise<any[]> {
    try {
      this.logger.log(`Retrieving similar content for employee: ${employeeId}`);

      // Generate embedding for the query
      const queryEmbedding = await LangChainService.generateEmbedding(query);

      // Get vector store for the employee
      const vectorStore = await LangChainService.getVectorStore(employeeId);

      // Define filter based on content types
      const filter = contentTypes?.length
        ? { content_type: { $in: contentTypes } }
        : undefined;

      // Search for similar content
      const results = await vectorStore.similaritySearchVectorWithScore(
        queryEmbedding,
        limit,
        filter,
      );

      // Format results
      return results.map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        similarity: score,
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving similar content';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error retrieving similar content: ${errorMessage}`, errorStack);
      return [];
    }
  }

  /**
   * Process and chunk content for embedding
   */
  async processContentForEmbedding(
    content: string,
    metadata: Omit<EmbeddingMetadata, 'contentPreview'>,
    chunkSize: number = 500,
  ): Promise<boolean> {
    try {
      this.logger.log(`Processing content for embedding, content type: ${metadata.contentType}`);

      // Simple chunking by tokens (approximate)
      const words = content.split(' ');
      const chunks = [];
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
      }

      // Store each chunk
      const results = await Promise.all(
        chunks.map((chunk, index) =>
          this.generateAndStoreEmbedding(chunk, {
            ...metadata,
            sourceId: `${metadata.sourceId}_chunk_${index}`,
            contentPreview: chunk,
          }),
        ),
      );

      return results.every(result => result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing content for embedding';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error processing content for embedding: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * Delete embeddings for an employee
   */
  async deleteEmployeeEmbeddings(employeeId: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting embeddings for employee: ${employeeId}`);
      await PineconeService.deleteNamespace(employeeId);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting embeddings';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error deleting embeddings: ${errorMessage}`, errorStack);
      return false;
    }
  }
} 
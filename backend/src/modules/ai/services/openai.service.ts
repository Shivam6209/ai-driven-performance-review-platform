import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    this.logger.log('OpenAI service initialized successfully');
  }

  /**
   * Generate text completion using OpenAI
   */
  async generateCompletion(
    messages: ChatMessage[],
    options: AIGenerationOptions = {}
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI service not initialized. Please check OPENAI_API_KEY.');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || 'gpt-4',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content generated from OpenAI');
      }

      this.logger.log(`Generated completion with ${content.length} characters`);
      return content;
    } catch (error) {
      this.logger.error('Error generating OpenAI completion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenAI generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI service not initialized. Please check OPENAI_API_KEY.');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      const embedding = response.data[0]?.embedding;
      
      if (!embedding) {
        throw new Error('No embedding generated from OpenAI');
      }

      this.logger.log(`Generated embedding with ${embedding.length} dimensions`);
      return embedding;
    } catch (error) {
      this.logger.error('Error generating OpenAI embedding:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenAI embedding failed: ${errorMessage}`);
    }
  }

  /**
   * Generate multiple embeddings in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error('OpenAI service not initialized. Please check OPENAI_API_KEY.');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
      });

      const embeddings = response.data.map(item => item.embedding);
      
      this.logger.log(`Generated ${embeddings.length} embeddings`);
      return embeddings;
    } catch (error) {
      this.logger.error('Error generating OpenAI batch embeddings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OpenAI batch embedding failed: ${errorMessage}`);
    }
  }

  /**
   * Check if OpenAI service is available
   */
  isAvailable(): boolean {
    return !!this.openai;
  }

  /**
   * Get usage statistics (if needed for monitoring)
   */
  async getUsageStats(): Promise<any> {
    // This would require additional API calls to OpenAI's usage endpoint
    // For now, return a placeholder
    return {
      available: this.isAvailable(),
      model: 'gpt-4',
      embeddingModel: 'text-embedding-ada-002',
    };
  }
} 
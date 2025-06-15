import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeService } from './pinecone.config';

export class LangChainService {
  private static openAIInstance: OpenAI | null = null;
  private static embeddingsInstance: OpenAIEmbeddings | null = null;

  static getOpenAI(): OpenAI {
    if (!this.openAIInstance) {
      this.openAIInstance = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-4',
        maxTokens: 2000,
      });
    }
    return this.openAIInstance;
  }

  static getEmbeddings(): OpenAIEmbeddings {
    if (!this.embeddingsInstance) {
      this.embeddingsInstance = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.embeddingsInstance;
  }

  static async getVectorStore(employeeId: string) {
    const pineconeIndex = await PineconeService.getIndex();
    const namespace = await PineconeService.createNamespace(employeeId);

    return await PineconeStore.fromExistingIndex(
      this.getEmbeddings(),
      {
        pineconeIndex,
        namespace,
        textKey: 'content',
      }
    );
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = this.getEmbeddings();
    const result = await embeddings.embedQuery(text);
    return result;
  }

  static async generateResponse(prompt: string, context?: string): Promise<string> {
    const llm = this.getOpenAI();
    let fullPrompt = prompt;
    
    if (context) {
      fullPrompt = `Context: ${context}\n\nQuestion: ${prompt}`;
    }

    const response = await llm.generate([fullPrompt]);
    return response.generations[0][0].text;
  }
} 
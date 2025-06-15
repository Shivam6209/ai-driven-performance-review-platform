import { PineconeClient } from '@pinecone-database/pinecone';

export class PineconeService {
  private static instance: PineconeClient | null = null;

  static async getClient(): Promise<PineconeClient> {
    if (!this.instance) {
      const pinecone = new PineconeClient();
      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
      });
      this.instance = pinecone;
    }
    return this.instance;
  }

  static async getIndex(indexName: string = process.env.PINECONE_INDEX_NAME!) {
    const pinecone = await this.getClient();
    return pinecone.Index(indexName);
  }

  static async createNamespace(employeeId: string) {
    // Create a namespace for each employee to ensure data isolation
    return `emp_${employeeId}`;
  }

  static async deleteNamespace(employeeId: string) {
    const index = await this.getIndex();
    const namespace = `emp_${employeeId}`;
    // Delete the employee's namespace when needed
    await index.delete1({ deleteAll: true, namespace });
  }

  // Verify index exists
  static async verifyIndexExists() {
    await this.getIndex();
  }
} 
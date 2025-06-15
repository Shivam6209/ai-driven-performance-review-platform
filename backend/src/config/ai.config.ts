import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10),
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    index: process.env.PINECONE_INDEX || 'performance-review-platform',
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10),
    chunkSize: parseInt(process.env.EMBEDDING_CHUNK_SIZE || '500', 10),
  },
  langchain: {
    memory: {
      enabled: process.env.LANGCHAIN_MEMORY_ENABLED === 'true',
      type: process.env.LANGCHAIN_MEMORY_TYPE || 'redis',
    },
  },
})); 
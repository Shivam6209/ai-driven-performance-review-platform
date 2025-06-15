import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService, EmbeddingMetadata } from './embedding.service';
import { LangChainService } from '../../config/langchain.config';
import { PineconeService } from '../../config/pinecone.config';

// Mock the LangChain and Pinecone services
jest.mock('../../config/langchain.config', () => ({
  LangChainService: {
    generateEmbedding: jest.fn(),
    getVectorStore: jest.fn(),
  },
}));

jest.mock('../../config/pinecone.config', () => ({
  PineconeService: {
    deleteNamespace: jest.fn(),
  },
}));

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingService],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAndStoreEmbedding', () => {
    const mockContent = 'This is test content for embedding';
    const mockMetadata: EmbeddingMetadata = {
      employeeId: 'employee1',
      contentType: 'feedback',
      sourceId: 'source1',
      contentPreview: 'This is test content',
      createdAt: new Date().toISOString(),
    };
    const mockEmbedding = [0.1, 0.2, 0.3]; // Simplified embedding vector
    const mockVectorStore = {
      addDocuments: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
      (LangChainService.generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
      (LangChainService.getVectorStore as jest.Mock).mockResolvedValue(mockVectorStore);
    });

    it('should generate and store embedding successfully', async () => {
      const result = await service.generateAndStoreEmbedding(mockContent, mockMetadata);
      
      expect(result).toBe(true);
      expect(LangChainService.generateEmbedding).toHaveBeenCalledWith(mockContent);
      expect(LangChainService.getVectorStore).toHaveBeenCalledWith(mockMetadata.employeeId);
      expect(mockVectorStore.addDocuments).toHaveBeenCalled();
    });

    it('should handle errors and return false', async () => {
      (LangChainService.generateEmbedding as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const result = await service.generateAndStoreEmbedding(mockContent, mockMetadata);
      
      expect(result).toBe(false);
    });
  });

  describe('retrieveSimilarContent', () => {
    const mockEmployeeId = 'employee1';
    const mockQuery = 'performance review';
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockSearchResults = [
      [
        { 
          pageContent: 'Content 1', 
          metadata: { id: 'doc1', content_type: 'feedback' } 
        },
        0.95,
      ],
      [
        { 
          pageContent: 'Content 2', 
          metadata: { id: 'doc2', content_type: 'goal' } 
        },
        0.85,
      ],
    ];
    const mockVectorStore = {
      similaritySearchVectorWithScore: jest.fn().mockResolvedValue(mockSearchResults),
    };

    beforeEach(() => {
      (LangChainService.generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
      (LangChainService.getVectorStore as jest.Mock).mockResolvedValue(mockVectorStore);
    });

    it('should retrieve similar content successfully', async () => {
      const result = await service.retrieveSimilarContent(mockEmployeeId, mockQuery);
      
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Content 1');
      expect(result[0].similarity).toBe(0.95);
      expect(result[1].content).toBe('Content 2');
      expect(result[1].similarity).toBe(0.85);
      
      expect(LangChainService.generateEmbedding).toHaveBeenCalledWith(mockQuery);
      expect(LangChainService.getVectorStore).toHaveBeenCalledWith(mockEmployeeId);
      expect(mockVectorStore.similaritySearchVectorWithScore).toHaveBeenCalledWith(
        mockEmbedding,
        5,
        undefined,
      );
    });

    it('should apply content type filter when provided', async () => {
      await service.retrieveSimilarContent(mockEmployeeId, mockQuery, ['feedback']);
      
      expect(mockVectorStore.similaritySearchVectorWithScore).toHaveBeenCalledWith(
        mockEmbedding,
        5,
        { content_type: { $in: ['feedback'] } },
      );
    });

    it('should handle errors and return empty array', async () => {
      (LangChainService.generateEmbedding as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const result = await service.retrieveSimilarContent(mockEmployeeId, mockQuery);
      
      expect(result).toEqual([]);
    });
  });

  describe('processContentForEmbedding', () => {
    const mockContent = 'This is a longer piece of content that needs to be chunked for embedding properly';
    const mockMetadata = {
      employeeId: 'employee1',
      contentType: 'review' as const,
      sourceId: 'source1',
      createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
      // Mock the generateAndStoreEmbedding method
      jest.spyOn(service, 'generateAndStoreEmbedding').mockResolvedValue(true);
    });

    it('should process and chunk content successfully', async () => {
      const result = await service.processContentForEmbedding(mockContent, mockMetadata, 5);
      
      expect(result).toBe(true);
      // With chunk size 5 and the content having 14 words, we should have 3 chunks
      expect(service.generateAndStoreEmbedding).toHaveBeenCalledTimes(3);
    });

    it('should handle errors and return false', async () => {
      jest.spyOn(service, 'generateAndStoreEmbedding').mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false);
      
      const result = await service.processContentForEmbedding(mockContent, mockMetadata, 5);
      
      expect(result).toBe(false);
    });
  });

  describe('deleteEmployeeEmbeddings', () => {
    const mockEmployeeId = 'employee1';

    beforeEach(() => {
      (PineconeService.deleteNamespace as jest.Mock).mockResolvedValue(true);
    });

    it('should delete employee embeddings successfully', async () => {
      const result = await service.deleteEmployeeEmbeddings(mockEmployeeId);
      
      expect(result).toBe(true);
      expect(PineconeService.deleteNamespace).toHaveBeenCalledWith(mockEmployeeId);
    });

    it('should handle errors and return false', async () => {
      (PineconeService.deleteNamespace as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const result = await service.deleteEmployeeEmbeddings(mockEmployeeId);
      
      expect(result).toBe(false);
    });
  });
}); 
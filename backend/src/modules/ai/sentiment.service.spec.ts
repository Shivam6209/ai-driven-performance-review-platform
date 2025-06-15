import { Test, TestingModule } from '@nestjs/testing';
import { SentimentService } from './sentiment.service';
import { LangChainService } from '../../config/langchain.config';

jest.mock('../../config/langchain.config', () => ({
  LangChainService: {
    generateResponse: jest.fn(),
  },
}));

describe('SentimentService', () => {
  let service: SentimentService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentimentService],
    }).compile();

    service = module.get<SentimentService>(SentimentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeFeedback', () => {
    it('should return sentiment analysis result', async () => {
      const mockResponse = JSON.stringify({
        tone: 'positive',
        quality: 85,
        specificity: 75,
        actionability: 80,
        biasIndicators: [],
        keywords: ['teamwork', 'communication', 'project'],
        summary: 'Excellent work on the project with good communication.',
      });

      (LangChainService.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.analyzeFeedback('Great job on the project! Your communication was excellent.');
      
      expect(result).toEqual({
        tone: 'positive',
        quality: 85,
        specificity: 75,
        actionability: 80,
        biasIndicators: [],
        keywords: ['teamwork', 'communication', 'project'],
        summary: 'Excellent work on the project with good communication.',
      });
      
      expect(LangChainService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('Analyze the following feedback text'));
    });

    it('should handle invalid JSON response', async () => {
      (LangChainService.generateResponse as jest.Mock).mockResolvedValue('Invalid JSON');

      const result = await service.analyzeFeedback('Test feedback');
      
      expect(result).toEqual({
        tone: 'neutral',
        quality: 50,
        specificity: 50,
        actionability: 50,
        biasIndicators: [],
        keywords: [],
        summary: 'Unable to analyze feedback.',
      });
    });

    it('should handle API errors', async () => {
      (LangChainService.generateResponse as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await service.analyzeFeedback('Test feedback');
      
      expect(result).toEqual({
        tone: 'neutral',
        quality: 50,
        specificity: 50,
        actionability: 50,
        biasIndicators: [],
        keywords: [],
        summary: 'Unable to analyze feedback.',
      });
    });
  });

  describe('detectBias', () => {
    it('should return bias indicators', async () => {
      const mockResponse = JSON.stringify([
        'Gender bias detected in language',
        'Recency bias in evaluation',
      ]);

      (LangChainService.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.detectBias('He is better than all the other team members.');
      
      expect(result).toEqual([
        'Gender bias detected in language',
        'Recency bias in evaluation',
      ]);
      
      expect(LangChainService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('Analyze the following feedback text for potential bias'));
    });

    it('should handle invalid JSON response', async () => {
      (LangChainService.generateResponse as jest.Mock).mockResolvedValue('Invalid JSON');

      const result = await service.detectBias('Test feedback');
      
      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      (LangChainService.generateResponse as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await service.detectBias('Test feedback');
      
      expect(result).toEqual([]);
    });
  });

  describe('suggestImprovements', () => {
    it('should return improvement suggestions', async () => {
      const mockResponse = JSON.stringify({
        improved: 'Your presentation skills have improved significantly. I noticed you effectively communicated complex ideas in a clear manner during the last meeting.',
        changes: [
          'Added specific examples',
          'Made feedback more actionable',
          'Improved clarity',
        ],
      });

      (LangChainService.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const originalContent = 'Your presentation was good.';
      const result = await service.suggestImprovements(originalContent);
      
      expect(result).toEqual({
        original: originalContent,
        improved: 'Your presentation skills have improved significantly. I noticed you effectively communicated complex ideas in a clear manner during the last meeting.',
        changes: [
          'Added specific examples',
          'Made feedback more actionable',
          'Improved clarity',
        ],
      });
      
      expect(LangChainService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('Analyze the following feedback text and suggest improvements'));
    });

    it('should handle invalid JSON response', async () => {
      (LangChainService.generateResponse as jest.Mock).mockResolvedValue('Invalid JSON');

      const originalContent = 'Test feedback';
      const result = await service.suggestImprovements(originalContent);
      
      expect(result).toEqual({
        original: originalContent,
        improved: originalContent,
        changes: ['Error generating improvements'],
      });
    });

    it('should handle API errors', async () => {
      (LangChainService.generateResponse as jest.Mock).mockRejectedValue(new Error('API error'));

      const originalContent = 'Test feedback';
      const result = await service.suggestImprovements(originalContent);
      
      expect(result).toEqual({
        original: originalContent,
        improved: originalContent,
        changes: ['Error generating improvements'],
      });
    });
  });

  describe('analyzeSentimentTrend', () => {
    it('should analyze sentiment trends correctly', async () => {
      // Mock analyzeFeedback to return predetermined results
      jest.spyOn(service, 'analyzeFeedback').mockImplementation(async (content) => {
        if (content.includes('excellent')) {
          return {
            tone: 'positive',
            quality: 90,
            specificity: 85,
            actionability: 80,
            biasIndicators: [],
            keywords: ['excellent'],
            summary: 'Excellent feedback',
          };
        } else if (content.includes('good')) {
          return {
            tone: 'positive',
            quality: 75,
            specificity: 70,
            actionability: 65,
            biasIndicators: [],
            keywords: ['good'],
            summary: 'Good feedback',
          };
        } else {
          return {
            tone: 'neutral',
            quality: 60,
            specificity: 55,
            actionability: 50,
            biasIndicators: [],
            keywords: ['average'],
            summary: 'Average feedback',
          };
        }
      });

      const feedbackItems = [
        { content: 'average work', date: '2023-01-15' },
        { content: 'good job', date: '2023-02-15' },
        { content: 'excellent performance', date: '2023-03-15' },
      ];

      const result = await service.analyzeSentimentTrend(feedbackItems);
      
      expect(result.trend).toBe('improving');
      expect(result.averageQuality).toBeGreaterThan(70);
      expect(result.periodComparisons.length).toBe(3);
      expect(result.periodComparisons[0].period).toBe('2023-1');
      expect(result.periodComparisons[2].period).toBe('2023-3');
      expect(result.periodComparisons[0].quality).toBeLessThan(result.periodComparisons[2].quality);
    });

    it('should handle empty feedback items', async () => {
      const result = await service.analyzeSentimentTrend([]);
      
      expect(result).toEqual({
        trend: 'stable',
        averageQuality: 50,
        periodComparisons: [],
      });
    });

    it('should handle errors during analysis', async () => {
      jest.spyOn(service, 'analyzeFeedback').mockRejectedValue(new Error('Analysis error'));

      const feedbackItems = [
        { content: 'test feedback', date: '2023-01-15' },
      ];

      const result = await service.analyzeSentimentTrend(feedbackItems);
      
      expect(result).toEqual({
        trend: 'stable',
        averageQuality: 50,
        periodComparisons: [],
      });
    });
  });
}); 
import { Test, TestingModule } from '@nestjs/testing';
import { SentimentController } from './sentiment.controller';
import { SentimentService, SentimentAnalysisResult } from './sentiment.service';
import { HttpException } from '@nestjs/common';

describe('SentimentController', () => {
  let controller: SentimentController;
  let service: SentimentService;

  beforeEach(async () => {
    const mockSentimentService = {
      analyzeFeedback: jest.fn(),
      detectBias: jest.fn(),
      suggestImprovements: jest.fn(),
      analyzeSentimentTrend: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SentimentController],
      providers: [
        {
          provide: SentimentService,
          useValue: mockSentimentService,
        },
      ],
    }).compile();

    controller = module.get<SentimentController>(SentimentController);
    service = module.get<SentimentService>(SentimentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyzeFeedback', () => {
    it('should return sentiment analysis result', async () => {
      const mockResult: SentimentAnalysisResult = {
        tone: 'positive',
        quality: 85,
        specificity: 75,
        actionability: 80,
        biasIndicators: [],
        keywords: ['teamwork', 'communication'],
        summary: 'Great feedback',
      };

      jest.spyOn(service, 'analyzeFeedback').mockResolvedValue(mockResult);

      const result = await controller.analyzeFeedback({ content: 'Test feedback' });
      
      expect(result).toEqual(mockResult);
      expect(service.analyzeFeedback).toHaveBeenCalledWith('Test feedback');
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'analyzeFeedback').mockRejectedValue(new Error('Test error'));

      await expect(controller.analyzeFeedback({ content: 'Test feedback' }))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('detectBias', () => {
    it('should return bias indicators', async () => {
      const mockBiasIndicators = ['Gender bias detected', 'Recency bias'];
      
      jest.spyOn(service, 'detectBias').mockResolvedValue(mockBiasIndicators);

      const result = await controller.detectBias({ content: 'Test feedback' });
      
      expect(result).toEqual({ biasIndicators: mockBiasIndicators });
      expect(service.detectBias).toHaveBeenCalledWith('Test feedback');
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'detectBias').mockRejectedValue(new Error('Test error'));

      await expect(controller.detectBias({ content: 'Test feedback' }))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('suggestImprovements', () => {
    it('should return improvement suggestions', async () => {
      const mockImprovements = {
        original: 'Test feedback',
        improved: 'Improved test feedback',
        changes: ['Added specificity'],
      };
      
      jest.spyOn(service, 'suggestImprovements').mockResolvedValue(mockImprovements);

      const result = await controller.suggestImprovements({ content: 'Test feedback' });
      
      expect(result).toEqual(mockImprovements);
      expect(service.suggestImprovements).toHaveBeenCalledWith('Test feedback');
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'suggestImprovements').mockRejectedValue(new Error('Test error'));

      await expect(controller.suggestImprovements({ content: 'Test feedback' }))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('analyzeTrend', () => {
    it('should return sentiment trend analysis', async () => {
      const mockTrendResult = {
        trend: 'improving' as const,
        averageQuality: 80,
        periodComparisons: [
          { period: '2023-01', quality: 70 },
          { period: '2023-02', quality: 80 },
          { period: '2023-03', quality: 90 },
        ],
      };
      
      const mockFeedbackItems = [
        { content: 'Feedback 1', date: '2023-01-15' },
        { content: 'Feedback 2', date: '2023-02-15' },
        { content: 'Feedback 3', date: '2023-03-15' },
      ];
      
      jest.spyOn(service, 'analyzeSentimentTrend').mockResolvedValue(mockTrendResult);

      const result = await controller.analyzeTrend({ feedbackItems: mockFeedbackItems });
      
      expect(result).toEqual(mockTrendResult);
      expect(service.analyzeSentimentTrend).toHaveBeenCalledWith(mockFeedbackItems);
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'analyzeSentimentTrend').mockRejectedValue(new Error('Test error'));

      await expect(controller.analyzeTrend({ 
        feedbackItems: [{ content: 'Test feedback', date: '2023-01-15' }] 
      }))
        .rejects
        .toThrow(HttpException);
    });
  });
}); 
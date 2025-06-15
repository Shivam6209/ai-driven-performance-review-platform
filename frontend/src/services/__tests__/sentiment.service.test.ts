import { sentimentService, SentimentAnalysisResult, SentimentTrend, BiasSummary } from '../sentiment.service';
import { apiService } from '../api';

// Mock the API service
jest.mock('../api', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('SentimentService', () => {
  const mockSentimentAnalysis: SentimentAnalysisResult = {
    sentiment: 'positive',
    score: 0.85,
    quality: 'high',
    qualityScore: 0.9,
    specificity: 0.8,
    actionability: 0.75,
    biasDetected: false,
    keywords: ['communication', 'teamwork', 'leadership'],
    summary: 'Great work on the project, especially with team communication.',
  };

  const mockSentimentTrend: SentimentTrend = {
    employeeId: 'emp123',
    period: 'month',
    trends: [
      {
        date: '2023-01-01',
        sentiment: {
          positive: 0.7,
          neutral: 0.2,
          constructive: 0.05,
          concerning: 0.05,
        },
        quality: {
          high: 0.8,
          medium: 0.15,
          low: 0.05,
        },
        averageScore: 0.85,
      },
    ],
  };

  const mockBiasSummary: BiasSummary = {
    totalFeedback: 100,
    biasDetected: 5,
    biasPercentage: 5,
    commonBiasTypes: [
      { type: 'gender bias', count: 3 },
      { type: 'age bias', count: 2 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeFeedback', () => {
    it('should analyze feedback content', async () => {
      // Setup
      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockSentimentAnalysis,
      });

      // Execute
      const result = await sentimentService.analyzeFeedback('Great job on the project!');

      // Verify
      expect(apiService.post).toHaveBeenCalledWith('/sentiment/analyze', {
        content: 'Great job on the project!',
      });
      expect(result).toEqual(mockSentimentAnalysis);
    });

    it('should handle errors during analysis', async () => {
      // Setup
      const errorMessage = 'API error';
      (apiService.post as jest.Mock).mockRejectedValue(new Error(errorMessage));

      // Execute & Verify
      await expect(sentimentService.analyzeFeedback('Great job!')).rejects.toThrow(errorMessage);
    });
  });

  describe('getEmployeeSentimentTrend', () => {
    it('should fetch employee sentiment trends', async () => {
      // Setup
      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockSentimentTrend,
      });

      // Execute
      const result = await sentimentService.getEmployeeSentimentTrend('emp123', 'month');

      // Verify
      expect(apiService.get).toHaveBeenCalledWith('/sentiment/trends/emp123?period=month');
      expect(result).toEqual(mockSentimentTrend);
    });

    it('should include optional date parameters', async () => {
      // Setup
      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockSentimentTrend,
      });

      // Execute
      await sentimentService.getEmployeeSentimentTrend('emp123', 'month', '2023-01-01', '2023-01-31');

      // Verify
      expect(apiService.get).toHaveBeenCalledWith(
        '/sentiment/trends/emp123?period=month&startDate=2023-01-01&endDate=2023-01-31'
      );
    });
  });

  describe('getTeamSentimentTrend', () => {
    it('should fetch team sentiment trends', async () => {
      // Setup
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [mockSentimentTrend],
      });

      // Execute
      const result = await sentimentService.getTeamSentimentTrend('mgr123', 'quarter');

      // Verify
      expect(apiService.get).toHaveBeenCalledWith('/sentiment/trends/team/mgr123?period=quarter');
      expect(result).toEqual([mockSentimentTrend]);
    });
  });

  describe('getSentimentAlerts', () => {
    it('should fetch sentiment alerts', async () => {
      // Setup
      const mockAlerts = [
        {
          id: 'alert1',
          employeeId: 'emp123',
          type: 'bias_detected',
          severity: 'high',
          message: 'Potential bias detected',
          timestamp: '2023-05-15T10:30:00Z',
          feedbackIds: ['feedback1'],
          acknowledged: false,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockAlerts,
      });

      // Execute
      const result = await sentimentService.getSentimentAlerts('emp123');

      // Verify
      expect(apiService.get).toHaveBeenCalledWith('/sentiment/alerts/emp123?');
      expect(result).toEqual(mockAlerts);
    });

    it('should filter unacknowledged alerts', async () => {
      // Setup
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [],
      });

      // Execute
      await sentimentService.getSentimentAlerts('emp123', true);

      // Verify
      expect(apiService.get).toHaveBeenCalledWith('/sentiment/alerts/emp123?onlyUnacknowledged=true');
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      // Setup
      (apiService.post as jest.Mock).mockResolvedValue({});

      // Execute
      await sentimentService.acknowledgeAlert('alert123');

      // Verify
      expect(apiService.post).toHaveBeenCalledWith('/sentiment/alerts/alert123/acknowledge', {});
    });
  });

  describe('getBiasSummary', () => {
    it('should fetch bias summary for all departments', async () => {
      // Setup
      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockBiasSummary,
      });

      // Execute
      const result = await sentimentService.getBiasSummary();

      // Verify
      expect(apiService.get).toHaveBeenCalledWith('/sentiment/bias');
      expect(result).toEqual(mockBiasSummary);
    });

    it('should fetch bias summary for specific department', async () => {
      // Setup
      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockBiasSummary,
      });

      // Execute
      await sentimentService.getBiasSummary('dept123');

      // Verify
      expect(apiService.get).toHaveBeenCalledWith('/sentiment/bias?departmentId=dept123');
    });
  });
}); 
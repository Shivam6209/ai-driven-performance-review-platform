import { apiService } from './api';

export interface GenerateReviewRequest {
  employeeId: string;
  revieweeId?: string; // For peer reviews
  reviewType: 'self' | 'peer' | 'manager';
  timeframe: '3months' | '6months' | '12months';
}

export interface ReviewContent {
  content: string;
  confidence: number;
  sources: ReviewSource[];
}

export interface ReviewSource {
  id: string;
  type: 'feedback' | 'goal' | 'project';
  content: string;
  timestamp: string;
  confidence: number;
}

export interface SentimentAnalysisResult {
  tone: 'positive' | 'neutral' | 'constructive' | 'negative';
  quality: number;
  specificity: number;
  actionability: number;
  biasIndicators: string[];
  keywords: string[];
  summary: string;
}

export interface SentimentTrendResult {
  trend: 'improving' | 'stable' | 'declining';
  averageQuality: number;
  periodComparisons: { period: string; quality: number }[];
}

class AIService {
  private readonly BASE_URL = '/ai';

  async generateReview(request: GenerateReviewRequest): Promise<ReviewContent> {
    const response = await apiService.post<ReviewContent>(`${this.BASE_URL}/generate-review`, request);
    return response.data;
  }

  async summarizeSelfAssessment(employeeId: string, content: string): Promise<ReviewContent> {
    const response = await apiService.post<ReviewContent>(`${this.BASE_URL}/summarize`, {
      employeeId,
      content,
      type: 'self-assessment'
    });
    return response.data;
  }

  async suggestFeedback(employeeId: string, revieweeId: string, context?: string): Promise<string> {
    const response = await apiService.post<{ suggestion: string }>(`${this.BASE_URL}/suggest-feedback`, {
      employeeId,
      revieweeId,
      context
    });
    return response.data.suggestion;
  }

  async validateContent(content: string, sources: ReviewSource[]): Promise<{
    isValid: boolean;
    issues?: string[];
  }> {
    const response = await apiService.post<{
      isValid: boolean;
      issues?: string[];
    }>(`${this.BASE_URL}/validate`, {
      content,
      sources
    });
    return response.data;
  }

  // Sentiment Analysis endpoints
  async analyzeFeedbackSentiment(content: string): Promise<SentimentAnalysisResult> {
    const response = await apiService.post<SentimentAnalysisResult>(`${this.BASE_URL}/sentiment/analyze`, {
      content
    });
    return response.data;
  }

  async detectBias(content: string): Promise<string[]> {
    const response = await apiService.post<{ biasIndicators: string[] }>(`${this.BASE_URL}/sentiment/detect-bias`, {
      content
    });
    return response.data.biasIndicators;
  }

  async suggestFeedbackImprovements(content: string): Promise<{
    original: string;
    improved: string;
    changes: string[];
  }> {
    const response = await apiService.post<{
      original: string;
      improved: string;
      changes: string[];
    }>(`${this.BASE_URL}/sentiment/suggest-improvements`, {
      content
    });
    return response.data;
  }

  async analyzeSentimentTrend(feedbackItems: { content: string; date: string }[]): Promise<SentimentTrendResult> {
    const response = await apiService.post<SentimentTrendResult>(`${this.BASE_URL}/sentiment/analyze-trend`, {
      feedbackItems
    });
    return response.data;
  }
}

export const aiService = new AIService(); 
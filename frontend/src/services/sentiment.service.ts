import { apiService } from './api';

export type SentimentType = 'positive' | 'neutral' | 'constructive' | 'concerning';
export type FeedbackQuality = 'high' | 'medium' | 'low';

export interface SentimentAnalysisResult {
  sentiment: SentimentType;
  score: number; // 0-1 score
  quality: FeedbackQuality;
  qualityScore: number; // 0-1 score
  specificity: number; // 0-1 score
  actionability: number; // 0-1 score
  biasDetected: boolean;
  biasExplanation?: string;
  keywords: string[];
  summary: string;
}

export interface SentimentTrend {
  employeeId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  trends: {
    date: string;
    sentiment: {
      positive: number;
      neutral: number;
      constructive: number;
      concerning: number;
    };
    quality: {
      high: number;
      medium: number;
      low: number;
    };
    averageScore: number;
  }[];
}

export interface SentimentAlert {
  id: string;
  employeeId: string;
  type: 'sentiment_shift' | 'concerning_feedback' | 'quality_drop' | 'bias_detected';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  feedbackIds: string[];
  acknowledged: boolean;
}

export interface BiasSummary {
  totalFeedback: number;
  biasDetected: number;
  biasPercentage: number;
  commonBiasTypes: Array<{ type: string; count: number }>;
}



export class SentimentService {
  private static instance: SentimentService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  static getInstance(): SentimentService {
    if (!SentimentService.instance) {
      SentimentService.instance = new SentimentService();
    }
    return SentimentService.instance;
  }

  async analyzeFeedback(content: string): Promise<SentimentAnalysisResult> {
    const response = await apiService.post('/sentiment/analyze', { content });
    return response.data as SentimentAnalysisResult;
  }

  async getEmployeeSentimentTrend(employeeId: string, period: string, startDate?: string, endDate?: string): Promise<SentimentTrend> {
    let url = `/sentiment/trends/${employeeId}?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const response = await apiService.get(url);
    return response.data as SentimentTrend;
  }

  async getTeamSentimentTrend(managerId: string, period: string): Promise<SentimentTrend[]> {
    const response = await apiService.get(`/sentiment/trends/team/${managerId}?period=${period}`);
    return response.data as SentimentTrend[];
  }

  async getSentimentAlerts(employeeId?: string, onlyUnacknowledged?: boolean): Promise<SentimentAlert[]> {
    let url = employeeId ? `/sentiment/alerts/${employeeId}?` : '/sentiment/alerts?';
    if (onlyUnacknowledged) url += 'onlyUnacknowledged=true';
    
    const response = await apiService.get(url);
    return response.data as SentimentAlert[];
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await apiService.post(`/sentiment/alerts/${alertId}/acknowledge`, {});
  }

  async getBiasSummary(departmentId?: string): Promise<BiasSummary> {
    const url = departmentId 
      ? `/sentiment/bias?departmentId=${departmentId}`
      : '/sentiment/bias';
      
    const response = await apiService.get(url);
    return response.data as BiasSummary;
  }
}

export const sentimentService = SentimentService.getInstance(); 
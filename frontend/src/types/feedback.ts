// Feedback types
import { Employee } from './employee';
import { OKRTag } from './okr';

export enum FeedbackType {
  PEER = 'peer',
  UPWARD = 'upward',
  DOWNWARD = 'downward',
  SELF = 'self'
}

export enum FeedbackVisibility {
  RECIPIENT_ONLY = 'recipient_only',
  RECIPIENT_AND_MANAGER = 'recipient_and_manager',
  PUBLIC = 'public'
}

export interface Feedback {
  id: string;
  content: string;
  giver: Employee;
  receiver: Employee;
  feedback_type: string;
  visibility: string;
  context_type?: string;
  context_id?: string;
  sentiment_score?: number;
  quality_score?: number;
  is_anonymous: boolean;
  parent_feedback?: Feedback;
  replies?: Feedback[];
  attachments?: Record<string, any>;
  read_at?: Date | string | null;
  acknowledged_at?: Date | string | null;
  tags?: OKRTag[];
  created_at: Date | string;
  updated_at: Date | string;
}

export interface FeedbackAnalytics {
  frequency?: {
    frequency_data: Record<string, number>;
    group_by: string;
    total_count: number;
  };
  quality?: {
    average_score: number;
    distribution: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
      very_poor: number;
    };
    sample_size: number;
  };
  sentiment?: {
    average_sentiment: number;
    trend: Array<{ date: Date | string; score: number }>;
    sample_size: number;
  };
  response_time?: {
    average_response_time: number;
    distribution: {
      under_1_hour: number;
      under_24_hours: number;
      under_48_hours: number;
      under_week: number;
      over_week: number;
    };
    sample_size: number;
  };
  action_completion?: {
    action_rate: number;
    acknowledged_count: number;
    total_count: number;
  };
  total_count?: number;
  date_range?: {
    start_date: Date | string;
    end_date: Date | string;
  };
}

export interface FeedbackAnalyticsParams {
  start_date?: string;
  end_date?: string;
  type?: 'frequency' | 'quality' | 'sentiment' | 'response_time' | 'action_completion';
  team_id?: string;
  department_id?: string;
}

export interface CreateFeedbackRequest {
  content: string;
  receiver_id: string;
  feedback_type: FeedbackType;
  visibility: FeedbackVisibility;
  context_type?: string;
  context_id?: string;
  is_anonymous?: boolean;
  tags?: string[];
}

export interface UpdateFeedbackRequest {
  content?: string;
  visibility?: FeedbackVisibility;
  tags?: string[];
}

export interface FeedbackResponse {
  id: string;
  content: string;
  feedback_id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface FeedbackThread {
  feedback: Feedback;
  responses: FeedbackResponse[];
  total_responses: number;
}

export interface FeedbackSummary {
  total_received: number;
  total_given: number;
  average_sentiment: number;
  recent_feedback: Feedback[];
  pending_responses: number;
} 
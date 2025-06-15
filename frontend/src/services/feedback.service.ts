import { apiService } from './api';
import { Feedback, FeedbackAnalytics } from '../types/feedback';

class FeedbackService {
  async createFeedback(data: any): Promise<Feedback> {
    const response = await apiService.post<Feedback>('/feedback', data);
    return response.data;
  }

  async getFeedback(id: string): Promise<Feedback> {
    const response = await apiService.get<Feedback>(`/feedback/${id}`);
    return response.data;
  }

  async getThread(id: string): Promise<Feedback> {
    const response = await apiService.get<Feedback>(`/feedback/thread/${id}`);
    return response.data;
  }

  async replyToFeedback(id: string, data: any): Promise<Feedback> {
    const response = await apiService.post<Feedback>(`/feedback/reply/${id}`, data);
    return response.data;
  }

  async getReceivedFeedback(read?: boolean): Promise<Feedback[]> {
    const queryParams = read !== undefined ? { filter: { read } } : undefined;
    const response = await apiService.get<Feedback[]>('/feedback/received', queryParams);
    return response.data;
  }

  async getGivenFeedback(): Promise<Feedback[]> {
    const response = await apiService.get<Feedback[]>('/feedback/given');
    return response.data;
  }

  async markAsRead(id: string): Promise<Feedback> {
    const response = await apiService.post<Feedback>(`/feedback/${id}/mark-read`, {});
    return response.data;
  }

  async acknowledge(id: string): Promise<Feedback> {
    const response = await apiService.post<Feedback>(`/feedback/${id}/acknowledge`, {});
    return response.data;
  }

  async updateFeedback(id: string, data: any): Promise<Feedback> {
    const response = await apiService.patch<Feedback>(`/feedback/${id}`, data);
    return response.data;
  }

  async deleteFeedback(id: string): Promise<void> {
    await apiService.delete<void>(`/feedback/${id}`);
  }

  async getFeedbackAnalytics(params: {
    start_date?: string;
    end_date?: string;
    type?: string;
    team_id?: string;
    department_id?: string;
  }): Promise<FeedbackAnalytics> {
    const queryParams = { filter: params };
    const response = await apiService.get<FeedbackAnalytics>('/feedback/analytics', queryParams);
    return response.data;
  }
}

export const feedbackService = new FeedbackService(); 
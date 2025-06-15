import { apiService } from './api';

export interface DashboardStats {
  totalOKRs: number;
  completedOKRs: number;
  averageProgress: number;
  activeOKRs: number;
  pendingReviews: number;
  feedbackReceived: number;
  goalCompletionRate: number;
  feedbackScore: number;
  reviewProgress: number;
}

export interface RecentActivity {
  id: string;
  type: 'okr_update' | 'feedback_received' | 'review_scheduled' | 'goal_completed' | 'feedback_given';
  title: string;
  description: string;
  time: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'error';
  userId?: string;
  relatedId?: string;
}

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'error';
  icon: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiService.get<DashboardData>('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return mock data with realistic values for development
      return {
        stats: {
          totalOKRs: 8,
          completedOKRs: 5,
          averageProgress: 75,
          activeOKRs: 3,
          pendingReviews: 2,
          feedbackReceived: 12,
          goalCompletionRate: 85,
          feedbackScore: 4.2,
          reviewProgress: 60,
        },
        recentActivities: [
          {
            id: '1',
            type: 'feedback_received',
            title: 'New Feedback Received',
            description: 'Sarah Johnson provided feedback on your Q4 project delivery',
            time: '2 hours ago',
            color: 'success',
            userId: 'user-1',
            relatedId: 'feedback-1'
          },
          {
            id: '2',
            type: 'okr_update',
            title: 'OKR Progress Updated',
            description: 'Customer satisfaction score objective updated to 85%',
            time: '1 day ago',
            color: 'primary',
            userId: 'user-1',
            relatedId: 'okr-1'
          },
          {
            id: '3',
            type: 'review_scheduled',
            title: 'Performance Review Scheduled',
            description: 'Q4 performance review scheduled for next week',
            time: '3 days ago',
            color: 'info',
            userId: 'user-1',
            relatedId: 'review-1'
          }
        ],
        quickActions: [
          {
            title: 'Create OKR',
            description: 'Set new objectives and key results',
            href: '/okrs',
            color: 'primary',
            icon: 'Assignment',
          },
          {
            title: 'Give Feedback',
            description: 'Provide feedback to team members',
            href: '/feedback',
            color: 'success',
            icon: 'Feedback',
          },
          {
            title: 'View Analytics',
            description: 'Check performance insights',
            href: '/analytics',
            color: 'info',
            icon: 'Analytics',
          },
          {
            title: 'Schedule Review',
            description: 'Schedule a performance review',
            href: '/reviews',
            color: 'warning',
            icon: 'Assignment',
          },
          {
            title: 'Team Dashboard',
            description: 'View your team performance',
            href: '/team',
            color: 'error',
            icon: 'Analytics',
          },
          {
            title: 'Goal Tracking',
            description: 'Track your goal progress',
            href: '/goals',
            color: 'primary',
            icon: 'Assignment',
          },
        ],
      };
    }
  }

  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalOKRs: 0,
        completedOKRs: 0,
        averageProgress: 0,
        activeOKRs: 0,
        pendingReviews: 0,
        feedbackReceived: 0,
        goalCompletionRate: 0,
        feedbackScore: 0,
        reviewProgress: 0,
      };
    }
  }

  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await apiService.get<RecentActivity[]>(`/dashboard/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  async getPerformanceOverview(): Promise<{
    goalCompletion: number;
    feedbackScore: number;
    reviewProgress: number;
  }> {
    try {
      const response = await apiService.get<{
        goalCompletion: number;
        feedbackScore: number;
        reviewProgress: number;
      }>('/dashboard/performance-overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching performance overview:', error);
      return {
        goalCompletion: 0,
        feedbackScore: 0,
        reviewProgress: 0,
      };
    }
  }
}

export const dashboardService = new DashboardService(); 
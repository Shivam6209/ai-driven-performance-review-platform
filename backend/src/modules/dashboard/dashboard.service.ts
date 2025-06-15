import { Injectable } from '@nestjs/common';

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
  type: 'okr_created' | 'feedback_received' | 'review_completed' | 'goal_updated';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  color: 'primary' | 'success' | 'info' | 'warning';
  icon: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
}

@Injectable()
export class DashboardService {
  async getDashboardData(userId: string) {
    return {
      userId,
      message: 'Dashboard data for development user',
      stats: {
        totalFeedback: 0,
        totalOKRs: 0,
        completedReviews: 0,
        pendingTasks: 0,
      },
      recentActivity: [],
      timestamp: new Date().toISOString(),
    };
  }

  async getStats(userId: string) {
    return {
      userId,
      totalEmployees: 1,
      totalDepartments: 1,
      totalFeedback: 0,
      totalOKRs: 0,
      completedReviews: 0,
      pendingReviews: 0,
      averageRating: 0,
      timestamp: new Date().toISOString(),
    };
  }

  async getRecentActivities(userId: string, limit: number = 10) {
    return {
      userId,
      activities: [
        {
          id: '1',
          type: 'feedback',
          description: 'Development user logged in',
          timestamp: new Date().toISOString(),
        },
      ],
      limit,
      total: 1,
    };
  }

  async getPerformanceOverview(userId: string) {
    return {
      userId,
      overview: {
        currentQuarter: 'Q1 2024',
        okrProgress: 0,
        feedbackScore: 0,
        reviewStatus: 'pending',
        goals: [],
      },
      timestamp: new Date().toISOString(),
    };
  }


} 
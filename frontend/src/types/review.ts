export type ReviewType = 'self' | 'manager' | 'peer' | 'upward' | '360';
export type ReviewStatus = 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface ReviewCycle {
  id: string;
  name: string;
  description?: string;
  cycleType: 'quarterly' | 'semi_annual' | 'annual' | 'project_based';
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  approvalDeadline: string;
  departmentId?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description?: string;
  reviewType: ReviewType;
  departmentId?: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  sections: ReviewTemplateSection[];
}

export interface ReviewTemplateSection {
  id: string;
  templateId: string;
  sectionName: string;
  sectionDescription?: string;
  sectionType: 'text' | 'rating' | 'multiple_choice' | 'goal_review';
  isRequired: boolean;
  maxLength?: number;
  ratingScale?: number;
  options?: string[];
  displayOrder: number;
  aiGenerationEnabled: boolean;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewCycleId: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  overallRating?: number;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  sections: ReviewSection[];
}

export interface ReviewSection {
  id: string;
  reviewId: string;
  templateSectionId: string;
  sectionName: string;
  content?: string;
  ratingValue?: number;
  isAIGenerated: boolean;
  aiConfidenceScore?: number;
  aiModelVersion?: string;
  aiGenerationTimestamp?: string;
  humanEdited: boolean;
  editCount: number;
  createdAt: string;
  updatedAt: string;
  sourceReferences?: SourceReference[];
}

export interface SourceReference {
  id: string;
  type: 'feedback' | 'goal' | 'review' | 'project';
  preview: string;
  timestamp: string;
  confidence: number;
}

export interface ReviewWorkflowStep {
  id: string;
  reviewId: string;
  stepName: string;
  stepType: 'draft' | 'ai_generation' | 'human_review' | 'submission' | 'approval';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  assignedTo?: string;
  completedBy?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface AIGenerationRequest {
  reviewId: string;
  sectionId: string;
  employeeId: string;
  contextData: {
    feedbackHistory?: boolean;
    goalProgress?: boolean;
    previousReviews?: boolean;
    projectSummaries?: boolean;
    timeRange: {
      start: string;
      end: string;
    };
  };
}

export interface AIGenerationResponse {
  content: string;
  confidenceScore: number;
  sourceReferences: SourceReference[];
  modelVersion: string;
  generationTimestamp: string;
}

export interface ReviewStats {
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  overdueReviews: number;
  averageCompletionTime: number;
  aiGenerationStats: {
    totalGenerated: number;
    averageConfidence: number;
    humanEditRate: number;
  };
} 
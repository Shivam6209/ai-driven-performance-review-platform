import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  // Note: This service is deprecated in favor of Firebase data service
  // For new implementations, use firebaseDataService instead
  return config;
});

// Types
interface PerformanceReview {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewCycle: {
    id: string;
    name: string;
  };
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  reviewType: 'self' | 'peer' | 'manager' | 'upward' | '360';
  overallRating?: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  sections?: ReviewSection[];
  workflowSteps?: ReviewWorkflowStep[];
}

interface ReviewCycle {
  id: string;
  name: string;
  description?: string;
  cycleType: 'quarterly' | 'biannual' | 'annual' | 'custom';
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  dueDate: string;
  department?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  reviews?: PerformanceReview[];
}

interface ReviewTemplate {
  id: string;
  name: string;
  description?: string;
  reviewType: 'self' | 'peer' | 'manager' | 'upward' | '360';
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  sections?: ReviewTemplateSection[];
}

interface ReviewTemplateSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  isRequired: boolean;
  sectionType: 'text' | 'rating' | 'multiple_choice' | 'goals' | 'competencies';
  config?: any;
}

interface ReviewSection {
  id: string;
  name: string;
  description?: string;
  content?: string;
  rating?: number;
  reviewId: string;
  templateSectionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewWorkflowStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo?: string;
  completedAt?: string;
  reviewId: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewAnalytics {
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  averageRating: number;
  reviewsByType: Record<string, number>;
  reviewsByStatus: Record<string, number>;
}

// Legacy interfaces for backward compatibility
interface SelfAssessment {
  achievements: string;
  challenges: string;
  skillsGained: string;
  goalsProgress: string;
  improvementAreas: string;
  overallRating: number;
}

interface ManagerAssessment {
  strengths: string;
  areasForImprovement: string;
  goalAssessment: string;
  skillsAssessment: string;
  overallFeedback: string;
  performanceRating: number;
}

interface PeerReviewContent {
  strengths: string;
  improvements: string;
  collaboration: string;
  overall: string;
}

interface PeerReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerAvatar?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  content?: PeerReviewContent;
}

interface ReviewHistory {
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  notes?: string;
}

interface ReviewData {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  reviewCycleId: string;
  reviewCycleName: string;
  status: 'draft' | 'self_assessment_pending' | 'manager_review_pending' | 'employee_acknowledgment_pending' | 'completed' | 'rejected';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  content: {
    selfAssessment?: SelfAssessment;
    managerAssessment?: ManagerAssessment;
    peerReviews?: PeerReview[];
    employeeAcknowledgment?: {
      acknowledged: boolean;
      comments?: string;
      acknowledgedAt?: string;
    };
    hrNotes?: string;
    finalNotes?: string;
  };
  history: ReviewHistory[];
}

export const reviewsService = {
  // ========================================
  // PERFORMANCE REVIEWS CRUD
  // ========================================

  /**
   * Create a new performance review
   */
  createPerformanceReview: async (reviewData: Partial<PerformanceReview>) => {
    const response = await apiClient.post<PerformanceReview>('/reviews', reviewData);
    return response.data;
  },

  /**
   * Get all performance reviews with optional filters
   */
  getAllPerformanceReviews: async (params?: {
    employeeId?: string;
    reviewerId?: string;
    status?: string;
    reviewType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PerformanceReview[]>('/reviews', { params });
    return response.data;
  },

  /**
   * Get a specific performance review by ID
   */
  getPerformanceReviewById: async (reviewId: string) => {
    const response = await apiClient.get<PerformanceReview>(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Update a performance review
   */
  updatePerformanceReview: async (reviewId: string, reviewData: Partial<PerformanceReview>) => {
    const response = await apiClient.put<PerformanceReview>(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  /**
   * Delete a performance review
   */
  deletePerformanceReview: async (reviewId: string) => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  // ========================================
  // REVIEW CYCLES CRUD
  // ========================================

  /**
   * Create a new review cycle
   */
  createReviewCycle: async (cycleData: Partial<ReviewCycle>) => {
    const response = await apiClient.post<ReviewCycle>('/reviews/cycles', cycleData);
    return response.data;
  },

  /**
   * Get all review cycles with optional filters
   */
  getAllReviewCycles: async (params?: {
    status?: string;
    departmentId?: string;
  }) => {
    const response = await apiClient.get<ReviewCycle[]>('/reviews/cycles', { params });
    return response.data;
  },

  /**
   * Get a specific review cycle by ID
   */
  getReviewCycleById: async (cycleId: string) => {
    const response = await apiClient.get<ReviewCycle>(`/reviews/cycles/${cycleId}`);
    return response.data;
  },

  /**
   * Update a review cycle
   */
  updateReviewCycle: async (cycleId: string, cycleData: Partial<ReviewCycle>) => {
    const response = await apiClient.put<ReviewCycle>(`/reviews/cycles/${cycleId}`, cycleData);
    return response.data;
  },

  /**
   * Delete a review cycle
   */
  deleteReviewCycle: async (cycleId: string) => {
    await apiClient.delete(`/reviews/cycles/${cycleId}`);
  },

  // ========================================
  // REVIEW TEMPLATES CRUD
  // ========================================

  /**
   * Create a new review template
   */
  createReviewTemplate: async (templateData: Partial<ReviewTemplate>) => {
    const response = await apiClient.post<ReviewTemplate>('/reviews/templates', templateData);
    return response.data;
  },

  /**
   * Get all review templates with optional filters
   */
  getAllReviewTemplates: async (params?: {
    reviewType?: string;
    departmentId?: string;
    isActive?: boolean;
  }) => {
    const response = await apiClient.get<ReviewTemplate[]>('/reviews/templates', { params });
    return response.data;
  },

  /**
   * Get a specific review template by ID
   */
  getReviewTemplateById: async (templateId: string) => {
    const response = await apiClient.get<ReviewTemplate>(`/reviews/templates/${templateId}`);
    return response.data;
  },

  /**
   * Update a review template
   */
  updateReviewTemplate: async (templateId: string, templateData: Partial<ReviewTemplate>) => {
    const response = await apiClient.put<ReviewTemplate>(`/reviews/templates/${templateId}`, templateData);
    return response.data;
  },

  /**
   * Delete a review template
   */
  deleteReviewTemplate: async (templateId: string) => {
    await apiClient.delete(`/reviews/templates/${templateId}`);
  },

  // ========================================
  // REVIEW SECTIONS CRUD
  // ========================================

  /**
   * Create a new review section
   */
  createReviewSection: async (sectionData: Partial<ReviewSection>) => {
    const response = await apiClient.post<ReviewSection>('/reviews/sections', sectionData);
    return response.data;
  },

  /**
   * Get all sections for a specific review
   */
  getReviewSections: async (reviewId: string) => {
    const response = await apiClient.get<ReviewSection[]>(`/reviews/${reviewId}/sections`);
    return response.data;
  },

  /**
   * Update a review section
   */
  updateReviewSection: async (sectionId: string, sectionData: Partial<ReviewSection>) => {
    const response = await apiClient.put<ReviewSection>(`/reviews/sections/${sectionId}`, sectionData);
    return response.data;
  },

  // ========================================
  // WORKFLOW STEPS CRUD
  // ========================================

  /**
   * Create a new workflow step
   */
  createWorkflowStep: async (stepData: Partial<ReviewWorkflowStep>) => {
    const response = await apiClient.post<ReviewWorkflowStep>('/reviews/workflow-steps', stepData);
    return response.data;
  },

  /**
   * Get all workflow steps for a specific review
   */
  getWorkflowSteps: async (reviewId: string) => {
    const response = await apiClient.get<ReviewWorkflowStep[]>(`/reviews/${reviewId}/workflow-steps`);
    return response.data;
  },

  /**
   * Update a workflow step
   */
  updateWorkflowStep: async (stepId: string, stepData: Partial<ReviewWorkflowStep>) => {
    const response = await apiClient.put<ReviewWorkflowStep>(`/reviews/workflow-steps/${stepId}`, stepData);
    return response.data;
  },

  // ========================================
  // ANALYTICS & REPORTING
  // ========================================

  /**
   * Get review analytics and overview
   */
  getReviewAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    reviewType?: string;
  }) => {
    const response = await apiClient.get<ReviewAnalytics>('/reviews/analytics/overview', { params });
    return response.data;
  },

  // ========================================
  // EMPLOYEE-SPECIFIC ENDPOINTS
  // ========================================

  /**
   * Get all reviews for a specific employee
   */
  getEmployeeReviews: async (employeeId: string) => {
    const response = await apiClient.get<PerformanceReview[]>(`/reviews/employee/${employeeId}`);
    return response.data;
  },

  /**
   * Get all reviews for a specific review cycle
   */
  getReviewsByCycle: async (cycleId: string, params?: any) => {
    const response = await apiClient.get<PerformanceReview[]>(`/reviews/cycle/${cycleId}/reviews`, { params });
    return response.data;
  },

  // ========================================
  // LEGACY METHODS (for backward compatibility)
  // ========================================

  /**
   * Get a specific review by ID (legacy)
   */
  getReviewById: async (reviewId: string) => {
    const response = await apiClient.get<ReviewData>(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Get reviews for a specific review cycle (legacy)
   */
  getReviewsByReviewCycle: async (reviewCycleId: string) => {
    const response = await apiClient.get<ReviewData[]>(`/reviews/cycle/${reviewCycleId}/reviews`);
    return response.data;
  },

  /**
   * Get employee feedback for a review cycle (legacy)
   */
  getEmployeeFeedbackForReviewCycle: async (employeeId: string, reviewCycleId: string) => {
    const response = await apiClient.get(`/reviews/feedback/${employeeId}/${reviewCycleId}`);
    return response.data;
  },

  /**
   * Submit a self-assessment for a review (legacy)
   */
  submitSelfAssessment: async (reviewId: string, selfAssessment: SelfAssessment) => {
    const response = await apiClient.post(`/reviews/${reviewId}/self-assessment`, selfAssessment);
    return response.data;
  },

  /**
   * Submit a manager assessment for a review (legacy)
   */
  submitManagerAssessment: async (
    reviewId: string, 
    managerAssessment: ManagerAssessment, 
    finalNotes?: string
  ) => {
    const response = await apiClient.post(`/reviews/${reviewId}/manager-assessment`, {
      assessment: managerAssessment,
      finalNotes,
    });
    return response.data;
  },

  /**
   * Submit employee acknowledgment for a review (legacy)
   */
  submitEmployeeAcknowledgment: async (
    reviewId: string, 
    acknowledged: boolean, 
    comments?: string
  ) => {
    const response = await apiClient.post(`/reviews/${reviewId}/acknowledgment`, {
      acknowledged,
      comments,
    });
    return response.data;
  },

  /**
   * Submit HR notes for a review (legacy)
   */
  submitHrNotes: async (reviewId: string, notes: string) => {
    const response = await apiClient.post(`/reviews/${reviewId}/hr-notes`, { notes });
    return response.data;
  },

  /**
   * Update review status (legacy)
   */
  updateReviewStatus: async (reviewId: string, status: ReviewData['status'], notes?: string) => {
    const response = await apiClient.patch(`/reviews/${reviewId}/status`, { status, notes });
    return response.data;
  },

  /**
   * Get peer reviews for an employee (legacy)
   */
  getPeerReviews: async (employeeId: string, reviewCycleId: string) => {
    const response = await apiClient.get<PeerReview[]>(`/reviews/peer-reviews/${employeeId}/${reviewCycleId}`);
    return response.data;
  },

  /**
   * Request peer reviews for an employee (legacy)
   */
  requestPeerReviews: async (employeeId: string, reviewCycleId: string, peerIds: string[]) => {
    const response = await apiClient.post(`/reviews/peer-reviews/request`, {
      employeeId,
      reviewCycleId,
      peerIds,
    });
    return response.data;
  },

  /**
   * Submit a peer review (legacy)
   */
  submitPeerReview: async (
    employeeId: string, 
    reviewCycleId: string, 
    peerReviewContent: PeerReviewContent
  ) => {
    const response = await apiClient.post(`/reviews/peer-reviews/submit`, {
      employeeId,
      reviewCycleId,
      content: peerReviewContent,
    });
    return response.data;
  },

  /**
   * Get review history (legacy)
   */
  getReviewHistory: async (reviewId: string) => {
    const response = await apiClient.get<ReviewHistory[]>(`/reviews/${reviewId}/history`);
    return response.data;
  },

  /**
   * Add review comment/note (legacy)
   */
  addReviewComment: async (reviewId: string, comment: string, isPrivate: boolean = false) => {
    const response = await apiClient.post(`/reviews/${reviewId}/comments`, {
      comment,
      isPrivate,
    });
    return response.data;
  },

  /**
   * Generate AI review
   */
  generateAIReview: async (employeeId: string, reviewCycleId: string, reviewType: string) => {
    const response = await apiClient.post(`/reviews/ai-generate`, {
      employeeId,
      reviewCycleId,
      reviewType,
    });
    return response.data;
  },
}; 
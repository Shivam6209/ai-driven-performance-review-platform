export interface CreatePerformanceReviewDto {
  employee_id: string;
  reviewer_id: string;
  review_cycle_id: string;
  review_type?: string;
  due_date: string;
}

export interface CreateReviewCycleDto {
  name: string;
  description?: string;
  cycle_type?: string;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  approval_deadline: string;
  department_id?: string;
  created_by_id: string;
}

export interface CreateReviewTemplateDto {
  name: string;
  description?: string;
  review_type?: string;
  template_structure: Record<string, any>;
  department_id?: string;
  created_by_id: string;
}

export interface CreateReviewSectionDto {
  name: string;
  description?: string;
  reviewId: string;
  content?: string;
  rating?: number;
  comments?: string;
  section_order?: number;
}

export interface CreateWorkflowStepDto {
  review_id: string;
  step_name: string;
  step_order: number;
  assigned_to_id?: string;
  due_date?: string;
} 
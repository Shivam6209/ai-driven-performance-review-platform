export type OKRLevel = 'company' | 'department' | 'team' | 'individual';
export type OKRStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue' | 'not_started' | 'in_progress';
export type OKRPriority = 'critical' | 'high' | 'medium' | 'low';

export interface OKR {
  id: string;
  title: string;
  description: string;
  level: OKRLevel;
  employee: {
    id: string;
    name: string;
    role: string;
  };
  parent_okr?: OKR;
  child_okrs?: OKR[];
  category?: {
    id: string;
    name: string;
    description?: string;
    color_code: string;
  };
  target_value: number;
  current_value: number;
  unit_of_measure: string;
  weight: number;
  priority: OKRPriority;
  start_date: string;
  due_date: string;
  status: OKRStatus;
  progress: number;
  approved_by?: {
    id: string;
    name: string;
    role: string;
  };
  approved_at?: string;
  updates: OKRUpdate[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface OKRSummary {
  id: string;
  title: string;
  level: OKRLevel;
  status: OKRStatus;
  progress: number;
  priority: OKRPriority;
  due_date: string;
  employee: {
    id: string;
    name: string;
    role: string;
  };
}

export interface OKRUpdate {
  id: string;
  okr_id: string;
  content: string;
  old_value: string | number;
  new_value: string | number;
  update_type: 'progress' | 'status' | 'note';
  updated_by: {
    id: string;
    name: string;
    role: string;
  };
  created_at: string;
}

export interface OKRCategory {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  is_active: boolean;
  created_at: string;
}

export interface OKRTag {
  id: string;
  name: string;
  description?: string;
  color_code?: string;
  created_at: string;
}

export interface OKRStats {
  totalOKRs: number;
  completedOKRs: number;
  averageProgress: number;
  atRiskOKRs: number;
  alignmentScore: number;
  departmentBreakdown: {
    departmentId: string;
    totalOKRs: number;
    averageProgress: number;
  }[];
}
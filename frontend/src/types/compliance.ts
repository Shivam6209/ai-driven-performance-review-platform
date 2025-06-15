export interface AuditLog {
  id: string;
  event_type: string;
  resource_type: string;
  resource_id?: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  metadata?: Record<string, any>;
  actor_id?: string;
  actor_type?: string;
  actor_ip?: string;
  status?: string;
  status_message?: string;
  created_at: string;
}

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description?: string;
  resource_type: string;
  retention_period_days: number;
  is_enabled: boolean;
  filters?: Record<string, any>;
  archive_strategy?: 'delete' | 'anonymize' | 'archive';
  archive_config?: Record<string, any>;
  last_execution_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogSearchParams {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface AuditLogSearchResult {
  data: AuditLog[];
  total: number;
}

export interface CreateDataRetentionPolicyDto {
  name: string;
  description?: string;
  resource_type: string;
  retention_period_days: number;
  is_enabled?: boolean;
  filters?: Record<string, any>;
  archive_strategy?: 'delete' | 'anonymize' | 'archive';
  archive_config?: Record<string, any>;
}

export interface UpdateDataRetentionPolicyDto {
  name?: string;
  description?: string;
  resource_type?: string;
  retention_period_days?: number;
  is_enabled?: boolean;
  filters?: Record<string, any>;
  archive_strategy?: 'delete' | 'anonymize' | 'archive';
  archive_config?: Record<string, any>;
}

export interface ComplianceReportParams {
  startDate: string;
  endDate: string;
  reportType: 'audit_activity' | 'data_retention' | 'access_control' | 'data_privacy';
}

export interface AuditActivityReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalEvents: number;
  eventTypeSummary: Record<string, number>;
  resourceTypeSummary: Record<string, number>;
  topActors: Array<{
    actorId: string;
    count: number;
  }>;
}

export interface DataRetentionReport {
  totalPolicies: number;
  enabledPolicies: number;
  policyByResourceType: Record<string, Array<{
    id: string;
    name: string;
    retentionPeriodDays: number;
    isEnabled: boolean;
    lastExecutionDate?: string;
  }>>;
}

export interface AccessControlReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalAccessAttempts: number;
  accessByStatus: {
    allowed: number;
    denied: number;
  };
  topResources: Array<{
    resource: string;
    count: number;
  }>;
  topDeniedActors: Array<{
    actorId: string;
    count: number;
  }>;
}

export interface DataPrivacyReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalDataAccess: number;
  accessByDataCategory: Record<string, number>;
  accessByPurpose: Record<string, number>;
}

export type ComplianceReport =
  | AuditActivityReport
  | DataRetentionReport
  | AccessControlReport
  | DataPrivacyReport; 
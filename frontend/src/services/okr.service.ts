import { OKR, OKRLevel, OKRStatus, OKRUpdate, OKRCategory, OKRPriority } from '@/types/okr';
import { apiService } from './api';

interface OKRFilters {
  level?: OKRLevel;
  status?: OKRStatus;
  employee_id?: string;
  category_id?: string;
}

interface OKRAnalytics {
  totalOKRs: number;
  completedOKRs: number;
  averageProgress: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    draft: number;
    active: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
}

interface OKRProgressData {
  overall: number;
  keyResults: { id: string; progress: number }[];
}

interface BulkUpdateItem {
  id: string;
  changes: Partial<OKR>;
}

export class OKRService {
  private static instance: OKRService;

  private constructor() {}

  static getInstance(): OKRService {
    if (!OKRService.instance) {
      OKRService.instance = new OKRService();
    }
    return OKRService.instance;
  }

  async getOKRs(filters?: OKRFilters): Promise<OKR[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const response = await apiService.get<any[]>(`/okr/objectives?${queryParams}`);
    return response.data.map(this.transformObjectiveToOKR);
  }

  private transformObjectiveToOKR(objective: any): OKR {
    // Map backend status to frontend status
    const statusMap: Record<string, OKRStatus> = {
      'draft': 'draft',
      'active': 'active',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };

    return {
      id: objective.id,
      title: objective.title,
      description: objective.description || '',
      level: objective.level as OKRLevel,
      employee: {
        id: objective.ownerId || '',
        name: objective.owner?.name || 'Unknown',
        role: objective.owner?.role || 'Employee'
      },
      parent_okr: objective.parentObjective ? this.transformObjectiveToOKR(objective.parentObjective) : undefined,
      child_okrs: objective.childObjectives?.map((child: any) => this.transformObjectiveToOKR(child)) || [],
      category: objective.category ? {
        id: objective.category.id,
        name: objective.category.name,
        description: objective.category.description,
        color_code: objective.category.colorCode || '#000000'
      } : undefined,
      target_value: 100,
      current_value: Number(objective.progress) || 0,
      unit_of_measure: '%',
      weight: 1,
      priority: 'medium' as OKRPriority,
      start_date: objective.startDate ? new Date(objective.startDate).toISOString() : new Date().toISOString(),
      due_date: objective.endDate ? new Date(objective.endDate).toISOString() : new Date().toISOString(),
      status: statusMap[objective.status] || 'draft',
      progress: Number(objective.progress) || 0,
      approved_by: undefined,
      approved_at: undefined,
      updates: [],
      tags: [],
      created_at: objective.createdAt ? new Date(objective.createdAt).toISOString() : new Date().toISOString(),
      updated_at: objective.updatedAt ? new Date(objective.updatedAt).toISOString() : new Date().toISOString()
    };
  }

  async getOKRById(id: string): Promise<OKR> {
    const response = await apiService.get<any>(`/okr/objectives/${id}`);
    return this.transformObjectiveToOKR(response.data);
  }

  async createOKR(data: Omit<OKR, 'id' | 'created_at' | 'updated_at'>): Promise<OKR> {
    const objectiveData = this.transformOKRToObjective(data);
    const response = await apiService.post<any>('/okr/objectives', objectiveData);
    return this.transformObjectiveToOKR(response.data);
  }

  async updateOKR(id: string, data: Partial<OKR>): Promise<OKR> {
    const objectiveData = this.transformOKRToObjective(data);
    const response = await apiService.patch<any>(`/okr/objectives/${id}`, objectiveData);
    return this.transformObjectiveToOKR(response.data);
  }

  private transformOKRToObjective(okr: Partial<OKR>): any {
    // Map frontend status to backend status
    const statusMap: Record<string, string> = {
      'draft': 'draft',
      'active': 'active',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'overdue': 'active',
      'not_started': 'draft',
      'in_progress': 'active'
    };

    return {
      title: okr.title,
      description: okr.description,
      level: okr.level,
      ownerId: okr.employee?.id,
      startDate: okr.start_date ? new Date(okr.start_date) : new Date(),
      endDate: okr.due_date ? new Date(okr.due_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: statusMap[okr.status || 'draft'] || 'not_started',
      progress: okr.progress || okr.current_value || 0,
      categoryId: okr.category?.id,
      parentObjectiveId: okr.parent_okr?.id
    };
  }

  async deleteOKR(id: string): Promise<void> {
    await apiService.delete(`/okr/objectives/${id}`);
  }

  async addOKRUpdate(okrId: string, update: Omit<OKRUpdate, 'id' | 'okr_id' | 'created_at'>): Promise<OKRUpdate> {
    const response = await apiService.post<OKRUpdate>(`/okr/updates`, { ...update, keyResultId: okrId });
    return response.data;
  }

  async getOKRUpdates(okrId: string): Promise<OKRUpdate[]> {
    const response = await apiService.get<OKRUpdate[]>(`/okr/key-results/${okrId}/updates`);
    return response.data;
  }

  async getChildOKRs(parentId: string): Promise<OKR[]> {
    const response = await apiService.get<any[]>(`/okr/objectives?parentObjectiveId=${parentId}`);
    return response.data.map(this.transformObjectiveToOKR);
  }

  async getCategories(): Promise<OKRCategory[]> {
    const response = await apiService.get<OKRCategory[]>('/okr/categories');
    return response.data;
  }

  async getOKRProgress(id: string): Promise<OKRProgressData> {
    const response = await apiService.get<OKRProgressData>(`/okr/objectives/${id}/alignment`);
    return response.data;
  }

  async bulkUpdateOKRs(updates: BulkUpdateItem[]): Promise<OKR[]> {
    // This endpoint might not exist in the backend, so we'll implement it as individual updates
    const results = await Promise.all(
      updates.map(update => this.updateOKR(update.id, update.changes))
    );
    return results;
  }

  async getOKRAnalytics(timeframe: 'week' | 'month' | 'quarter' | 'year'): Promise<OKRAnalytics> {
    // This endpoint might not exist, so we'll return mock data for now
    return {
      totalOKRs: 0,
      completedOKRs: 0,
      averageProgress: 0,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
      byStatus: { draft: 0, active: 0, completed: 0, cancelled: 0, overdue: 0 }
    };
  }

  async getOKRSummary(): Promise<OKRAnalytics> {
    return this.getOKRAnalytics('quarter');
  }

  async updateOKRProgress(id: string, progressData: { progress: number; notes?: string }): Promise<OKR> {
    const response = await apiService.patch<any>(`/okr/objectives/${id}`, progressData);
    return this.transformObjectiveToOKR(response.data);
  }

  async getEmployeeOkrsForReviewCycle(employeeId: string, reviewCycleId: string): Promise<OKR[]> {
    const response = await apiService.get<any[]>(`/okr/objectives?ownerId=${employeeId}`);
    return response.data.map(this.transformObjectiveToOKR);
  }
}

// Export singleton instance
export const okrService = OKRService.getInstance(); 
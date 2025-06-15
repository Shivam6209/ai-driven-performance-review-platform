import { apiService } from './api';

export interface VectorSearchQuery {
  employeeId: string;
  query: string;
  contentTypes?: ('feedback' | 'goal' | 'review' | 'project')[];
  timeframe?: '3months' | '6months' | '12months' | 'all';
  limit?: number;
  minScore?: number;
}

export interface VectorSearchResult {
  id: string;
  employeeId: string;
  contentType: 'feedback' | 'goal' | 'review' | 'project';
  content: string;
  score: number;
  metadata: {
    createdAt: string;
    sourceId: string;
    tags: string[];
    visibility: string;
  };
}

export interface EmbeddingRequest {
  employeeId: string;
  contentType: 'feedback' | 'goal' | 'review' | 'project';
  content: string;
  metadata: {
    sourceId: string;
    tags?: string[];
    visibility?: string;
  };
}

class VectorService {
  private readonly BASE_URL = '/vector';

  async search(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    const response = await apiService.post<VectorSearchResult[]>(`${this.BASE_URL}/search`, query);
    return response.data;
  }

  async createEmbedding(request: EmbeddingRequest): Promise<{ id: string }> {
    const response = await apiService.post<{ id: string }>(`${this.BASE_URL}/embed`, request);
    return response.data;
  }

  async deleteEmbedding(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/embed/${id}`);
  }

  async deleteEmployeeEmbeddings(employeeId: string, contentType?: string): Promise<{ count: number }> {
    const url = contentType 
      ? `${this.BASE_URL}/embed/employee/${employeeId}?contentType=${contentType}`
      : `${this.BASE_URL}/embed/employee/${employeeId}`;
      
    const response = await apiService.delete<{ count: number }>(url);
    return response.data;
  }

  async validateRelationship(employeeId: string, revieweeId: string): Promise<{
    isValid: boolean;
    relationship?: 'manager' | 'peer' | 'direct_report' | 'self';
  }> {
    const url = `${this.BASE_URL}/validate-relationship?employeeId=${employeeId}&revieweeId=${revieweeId}`;
    const response = await apiService.get<{
      isValid: boolean;
      relationship?: 'manager' | 'peer' | 'direct_report' | 'self';
    }>(url);
    return response.data;
  }
}

export const vectorService = new VectorService(); 
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
  include?: string[];
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
  timestamp: string;
}

export interface SuccessResponse {
  message: string;
  status: number;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface BatchOperationResponse {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors?: ErrorResponse[];
} 
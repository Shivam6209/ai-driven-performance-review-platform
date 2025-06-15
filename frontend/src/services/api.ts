import axios from 'axios';
import { ApiResponse, ErrorResponse, QueryParams } from '@/types';

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config: any) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401) {
          console.log('🔐 API: 401 Unauthorized received');
          // Don't automatically sign out or redirect here
          // Let the component handle the error appropriately
          // This prevents redirect loops and gives better user experience
        }
        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: any): ApiResponse<T> {
    return {
      data: response.data,
      message: response.data.message,
      status: response.status,
    };
  }

  private handleError(error: any): ErrorResponse {
    return {
      message: error.response?.data?.message || 'An error occurred',
      errors: error.response?.data?.errors,
      status: error.response?.status || 500,
      timestamp: new Date().toISOString(),
    };
  }

  async get<T>(url: string, params?: QueryParams): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, { params });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async upload(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const apiService = new ApiService(); 
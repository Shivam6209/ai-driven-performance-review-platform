import { apiService } from './api';
import { User } from '@/types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  phoneNumber?: string;
  bio?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile extends User {
  userType?: 'employee' | 'user';
  jobTitle?: string;
  phoneNumber?: string;
  bio?: string;
}

class UserService {
  /**
   * Get current user profile - works for all user types
   */
  async getCurrentProfile(): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>('/auth/me');
    return response.data;
  }

  /**
   * Update user profile - tries employee endpoint first, falls back to user update
   */
  async updateProfile(userId: string, profileData: UpdateProfileRequest): Promise<UserProfile> {
    try {
      // Try to update as employee first
      const response = await apiService.patch<UserProfile>(`/employees/${userId}`, profileData);
      return response.data;
    } catch (error: any) {
      // If employee update fails, try user update endpoint
      if (error.status === 404 || error.status === 403) {
        const response = await apiService.patch<UserProfile>(`/auth/profile`, profileData);
        return response.data;
      }
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    await apiService.post('/auth/change-password', passwordData);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile> {
    try {
      // Try employee endpoint first
      const response = await apiService.get<UserProfile>(`/employees/${userId}`);
      return response.data;
    } catch (error: any) {
      // Fall back to user endpoint
      if (error.status === 404) {
        const response = await apiService.get<UserProfile>(`/auth/users/${userId}`);
        return response.data;
      }
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile> {
    try {
      // Try employee endpoint first
      const response = await apiService.get<UserProfile>(`/employees/email/${email}`);
      return response.data;
    } catch (error: any) {
      // Fall back to user endpoint
      if (error.status === 404) {
        const response = await apiService.get<UserProfile>(`/auth/users/email/${email}`);
        return response.data;
      }
      throw error;
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(userId: string, imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiService.post<{ imageUrl: string }>(
      `/auth/profile/image`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.imageUrl;
  }

  /**
   * Delete profile image
   */
  async deleteProfileImage(userId: string): Promise<void> {
    await apiService.delete(`/auth/profile/image`);
  }
}

export const userService = new UserService(); 
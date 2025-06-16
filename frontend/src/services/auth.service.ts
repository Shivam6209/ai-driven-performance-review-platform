import { apiService } from './api';
import { AuthResponse, LoginCredentials, PasswordResetRequest, PasswordResetConfirm, User, RegisterRequest } from '@/types';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { userProfileService } from './user-profile.service';

// New interfaces for multi-tenant registration
export interface RegisterAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  jobTitle: string;
}

export interface RegisterWithInvitationRequest {
  firstName: string;
  lastName: string;
  password: string;
  jobTitle: string;
  invitationToken: string;
}

class AuthService {
  private readonly BASE_URL = '/auth';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 AuthService - Login attempt for:', credentials.email);
    try {
      // Call backend API for authentication
      const response = await apiService.post<{access_token: string, user: any}>(`${this.BASE_URL}/login`, {
        email: credentials.email,
        password: credentials.password
      });

      const { access_token, user: backendUser } = response.data;
      console.log('✅ Login successful, received user:', {
        id: backendUser.id,
        email: backendUser.email,
        role: backendUser.role,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName
      });
      
      // Store token in localStorage for API requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', access_token);
        console.log('🔑 Token stored in localStorage');
      }

      // Transform backend user to frontend User type
      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        role: backendUser.role || 'employee',
        isActive: backendUser.isActive !== false,
        profileImageUrl: backendUser.profileImageUrl,
        departmentId: backendUser.departmentId,
        managerId: backendUser.managerId,
        organizationId: backendUser.organizationId,
      };

      console.log('👤 Transformed user object:', user);
      return {
        token: access_token,
        user
      };
    } catch (error: any) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Call backend API for registration
      const response = await apiService.post<{access_token?: string, user: any}>(`${this.BASE_URL}/register`, {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      });

      const { access_token, user: backendUser } = response.data;
      
      // Store token if provided
      if (access_token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', access_token);
      }

      // Transform backend user to frontend User type
      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        role: backendUser.role || 'employee',
        isActive: backendUser.isActive !== false,
        profileImageUrl: backendUser.profileImageUrl,
        departmentId: backendUser.departmentId,
        managerId: backendUser.managerId,
        organizationId: backendUser.organizationId,
      };

      return {
        token: access_token || '',
        user
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  async registerAdmin(data: RegisterAdminRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{access_token: string, user: any}>(`${this.BASE_URL}/register-admin`, data);

      const { access_token, user: backendUser } = response.data;
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', access_token);
      }

      // Transform backend user to frontend User type
      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        role: backendUser.role || 'admin',
        isActive: backendUser.isActive !== false,
        profileImageUrl: backendUser.profileImageUrl,
        departmentId: backendUser.departmentId,
        managerId: backendUser.managerId,
        organizationId: backendUser.organizationId,
      };

      return {
        token: access_token,
        user
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Admin registration failed');
    }
  }

  async registerWithInvitation(data: RegisterWithInvitationRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{access_token: string, user: any}>(`${this.BASE_URL}/register-with-invitation`, data);

      const { access_token, user: backendUser } = response.data;
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', access_token);
      }

      // Transform backend user to frontend User type
      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        role: backendUser.role || 'employee',
        isActive: backendUser.isActive !== false,
        profileImageUrl: backendUser.profileImageUrl,
        departmentId: backendUser.departmentId,
        managerId: backendUser.managerId,
        organizationId: backendUser.organizationId,
      };

      return {
        token: access_token,
        user
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration with invitation failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint for session cleanup
      try {
        await apiService.post(`${this.BASE_URL}/logout`, {});
      } catch (backendError) {
        // Log the error but don't fail the logout process
        console.warn('Backend logout failed:', backendError);
      }
      
      // Clear stored token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    console.log('🔍 AuthService - Getting current user...');
    try {
      const response = await apiService.get<User>(`${this.BASE_URL}/me`);
      console.log('✅ Current user retrieved:', {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role,
        firstName: response.data.firstName,
        lastName: response.data.lastName
      });
      return response.data;
    } catch (error) {
      console.log('❌ Failed to get current user:', error);
      throw error;
    }
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiService.post(`${this.BASE_URL}/password-reset`, data);
  }

  async resetPassword(data: PasswordResetConfirm): Promise<void> {
    await apiService.post(`${this.BASE_URL}/password-reset/confirm`, data);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiService.post(`${this.BASE_URL}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      const token = await currentUser.getIdToken(true); // Force refresh
      
      const user: User = {
        id: currentUser.uid,
        email: currentUser.email || '',
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        role: 'employee',
        isActive: true,
      };

      return { token, user };
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  async getToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      return await currentUser.getIdToken();
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService(); 
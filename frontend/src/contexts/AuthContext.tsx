import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { User, UserRegistrationData, AuthResponse } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, userData: UserRegistrationData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  setUser: (user: User) => void;
  // Legacy compatibility
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, userData: UserRegistrationData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate with backend
    const checkAuthState = async () => {
      console.log('🔄 AuthContext - Checking auth state...');
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token found:', !!token);
      
      if (token) {
        try {
          console.log('🔍 Validating token with backend...');
          // Validate token with backend
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
          console.log('✅ Auth state restored successfully');
          console.log('👤 Restored User:', {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          });
        } catch (error) {
          console.log('❌ Token validation failed:', error);
          localStorage.removeItem('auth_token');
          setCurrentUser(null);
        }
      } else {
        console.log('❌ No token found, user not authenticated');
        setCurrentUser(null);
      }
      setLoading(false);
      console.log('🏁 Auth state check completed');
    };

    checkAuthState();
  }, []);

  async function signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authService.login({ email, password });
      setCurrentUser(response.user);
      console.log('Sign in successful:', response.user.email);
      return response;
    } catch (error) {
      console.log('Sign in failed:', error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, userData: UserRegistrationData): Promise<AuthResponse> {
    try {
      const response = await authService.register({ 
        email, 
        password, 
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      });
      setCurrentUser(response.user);
      console.log('Sign up successful:', response.user.email);
      return response;
    } catch (error) {
      console.log('Sign up failed:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await authService.logout();
      setCurrentUser(null);
      console.log('Sign out successful');
      
      // Redirect to landing page after successful logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.log('Sign out failed:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await authService.requestPasswordReset({ email });
      console.log('Password reset requested for:', email);
    } catch (error) {
      console.log('Password reset failed:', error);
      throw error;
    }
  }

  async function updatePassword(oldPassword: string, newPassword: string) {
    try {
      await authService.changePassword(oldPassword, newPassword);
      console.log('Password updated successfully');
    } catch (error) {
      console.log('Password update failed:', error);
      throw error;
    }
  }

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    setUser: (user: User) => setCurrentUser(user),
    // Legacy compatibility
    user: currentUser,
    isLoading: loading,
    login: signIn,
    register: signUp,
    logout: signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 
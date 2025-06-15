import { apiService } from './api';

export interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  role: string;
  permissions?: string[];
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  organizationId: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface CreateInvitationRequest {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  permissions?: string[];
  organizationId: string;
}

export const invitationsService = {
  /**
   * Get all invitations for current user's organization
   */
  getInvitations: async (): Promise<Invitation[]> => {
    const response = await apiService.get<Invitation[]>('/invitations');
    return response.data;
  },

  /**
   * Create a new invitation
   */
  createInvitation: async (data: CreateInvitationRequest): Promise<Invitation> => {
    const response = await apiService.post<Invitation>('/invitations', data);
    return response.data;
  },

  /**
   * Resend an invitation
   */
  resendInvitation: async (invitationId: string): Promise<Invitation> => {
    const response = await apiService.put<Invitation>(`/invitations/${invitationId}/resend`, {});
    return response.data;
  },

  /**
   * Cancel an invitation
   */
  cancelInvitation: async (invitationId: string): Promise<void> => {
    await apiService.delete(`/invitations/${invitationId}`);
  },

  /**
   * Get invitation by token (public endpoint)
   */
  getInvitationByToken: async (token: string): Promise<Invitation> => {
    const response = await apiService.get<Invitation>(`/invitations/token/${token}`);
    return response.data;
  },

  /**
   * Validate invitation token (public endpoint)
   */
  validateInvitationToken: async (token: string): Promise<{ valid: boolean; invitation?: Invitation }> => {
    try {
      const invitation = await invitationsService.getInvitationByToken(token);
      return { valid: true, invitation };
    } catch (error) {
      return { valid: false };
    }
  }
}; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { invitationsService, Invitation, CreateInvitationRequest } from '@/services/invitations.service';
import { useRouter } from 'next/router';

interface InvitationFormData {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  permissions: string[];
}

const InvitationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<InvitationFormData>({
    email: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    role: 'EMPLOYEE',
    permissions: []
  });

  const availablePermissions = ['CREATE', 'READ', 'WRITE', 'DELETE'];
  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'HR', label: 'HR' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  // Check if user has permission to manage invitations
  useEffect(() => {
    if (currentUser && !['ADMIN', 'HR'].includes(currentUser.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [currentUser, router]);

  // Load invitations
  useEffect(() => {
    if (currentUser && ['ADMIN', 'HR'].includes(currentUser.role)) {
      loadInvitations();
    }
  }, [currentUser]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await invitationsService.getInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.organizationId) {
      setError('Organization ID not found');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const invitationData = {
        ...formData,
        organizationId: currentUser.organizationId
      };

      await invitationsService.createInvitation(invitationData);
      setSuccess(`Invitation sent to ${formData.email} with temporary credentials`);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        jobTitle: '',
        role: 'EMPLOYEE',
        permissions: []
      });
      setShowCreateForm(false);
      await loadInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      await invitationsService.resendInvitation(invitationId);
      setSuccess(`Invitation resent to ${email} with new credentials`);
      await loadInvitations();
    } catch (err: any) {
      setError('Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Are you sure you want to cancel the invitation for ${email}?`)) {
      return;
    }

    try {
      await invitationsService.cancelInvitation(invitationId);
      setSuccess(`Invitation cancelled for ${email}`);
      await loadInvitations();
    } catch (err: any) {
      setError('Failed to cancel invitation');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'expired':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!currentUser || !['ADMIN', 'HR'].includes(currentUser.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Invitation Management</h1>
              <p className="text-indigo-100 mt-2">Send invitations with temporary credentials via email</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              + Send Invitation
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Create Invitation Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send New Invitation</h2>
              <form onSubmit={handleCreateInvitation} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john.doe@company.com"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Software Engineer"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-600">
                    <strong>Note:</strong> A temporary password will be generated and sent to the user's email along with their login credentials.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        email: '',
                        firstName: '',
                        lastName: '',
                        jobTitle: '',
                        role: 'EMPLOYEE',
                        permissions: []
                      });
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isCreating ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invitations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Sent Invitations</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No invitations sent yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                Send your first invitation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invitation.firstName} {invitation.lastName}
                          </div>
                          {invitation.jobTitle && (
                            <div className="text-sm text-gray-500">{invitation.jobTitle}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invitation.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {invitation.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(invitation.status)}>
                          {invitation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {invitation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Resend
                              </button>
                              <button
                                onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {invitation.status === 'accepted' && (
                            <span className="text-gray-400">Completed</span>
                          )}
                          {invitation.status === 'expired' && (
                            <button
                              onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-medium">P</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invitations.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium">A</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invitations.filter(inv => inv.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium">E</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invitations.filter(inv => inv.status === 'expired').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage; 
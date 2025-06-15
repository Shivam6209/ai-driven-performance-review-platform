import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import RolesList from '../RolesList';
import { RbacService } from '../../../services/rbac.service';

// Mock the RBAC service
jest.mock('../../../services/rbac.service', () => ({
  RbacService: {
    getAllRoles: jest.fn(),
    deleteRole: jest.fn(),
  },
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RolesList Component', () => {
  const mockRoles = [
    {
      id: 'role1',
      name: 'Admin',
      description: 'Administrator role',
      is_system_role: true,
      is_custom: false,
      permissions: [
        { id: 'perm1', name: 'Create User', resource: 'user', action: 'create', is_system_permission: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 'perm2', name: 'Edit User', resource: 'user', action: 'update', is_system_permission: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
      ],
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: 'role2',
      name: 'User',
      description: 'Regular user role',
      is_system_role: false,
      is_custom: true,
      parent_role_id: 'role1',
      permissions: [
        { id: 'perm1', name: 'Create User', resource: 'user', action: 'create', is_system_permission: true, created_at: '2023-01-01', updated_at: '2023-01-01' },
      ],
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (RbacService.getAllRoles as jest.Mock).mockResolvedValue(mockRoles);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SnackbarProvider>
          <RolesList />
        </SnackbarProvider>
      </MemoryRouter>
    );
  };

  it('renders the component with roles', async () => {
    renderComponent();

    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    // Check if both roles are rendered
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Administrator role')).toBeInTheDocument();
    expect(screen.getByText('Regular user role')).toBeInTheDocument();

    // Check if system role chip is rendered
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();

    // Check if permissions are rendered
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });

  it('navigates to create role page when create button is clicked', async () => {
    renderComponent();

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    // Click create role button
    fireEvent.click(screen.getByText('Create Role'));

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/admin/roles/create');
  });

  it('navigates to edit role page when edit button is clicked', async () => {
    renderComponent();

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // Find the edit button for the second role (User) which is not a system role
    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[1].closest('button')!);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/admin/roles/edit/role2');
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    renderComponent();

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // Find the delete button for the second role (User) which is not a system role
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[1].closest('button')!);

    // Check if delete confirmation dialog is shown
    expect(screen.getByText('Delete Role')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete the role "User"?')).toBeInTheDocument();
  });

  it('deletes a role when confirmed', async () => {
    (RbacService.deleteRole as jest.Mock).mockResolvedValue(undefined);

    renderComponent();

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // Find the delete button for the second role (User) which is not a system role
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[1].closest('button')!);

    // Click the confirm delete button
    fireEvent.click(screen.getByText('Delete'));

    // Check if deleteRole was called with the correct role ID
    expect(RbacService.deleteRole).toHaveBeenCalledWith('role2');
  });

  it('shows hierarchy dialog when view hierarchy button is clicked', async () => {
    renderComponent();

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // Find the hierarchy button for the second role (User) which has a parent role
    const hierarchyButtons = screen.getAllByTestId('AccountTreeIcon');
    fireEvent.click(hierarchyButtons[1].closest('button')!);

    // Check if hierarchy dialog is shown
    expect(screen.getByText('Role Hierarchy')).toBeInTheDocument();
  });

  it('renders empty state when no roles are available', async () => {
    (RbacService.getAllRoles as jest.Mock).mockResolvedValue([]);
    
    renderComponent();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if empty state message is shown
    expect(screen.getByText('No roles found')).toBeInTheDocument();
  });
}); 
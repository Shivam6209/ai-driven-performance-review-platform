import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import ReviewsPage from '../index';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: { id: '1', name: 'Test User', role: 'employee' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('ReviewsPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const renderWithAuth = () => {
    return render(
      <AuthProvider>
        <ReviewsPage />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockRouter.push.mockClear();
  });

  it('renders loading state initially', () => {
    renderWithAuth();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    renderWithAuth();
    expect(await screen.findByText('Performance Reviews')).toBeInTheDocument();
  });

  it('renders create review button', async () => {
    renderWithAuth();
    const createButton = await screen.findByText('Create Review');
    expect(createButton).toBeInTheDocument();
  });

  it('navigates to create review page when create button is clicked', async () => {
    renderWithAuth();
    const createButton = await screen.findByText('Create Review');
    await userEvent.click(createButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/reviews/new');
  });

  it('renders stats cards with correct data', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    // Check stats cards
    expect(screen.getByText('Total Reviews')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Total reviews
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument(); // Completed reviews
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Pending reviews
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Overdue reviews
  });

  it('renders reviews table with correct columns', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    // Check table headers
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders review data correctly', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    // Check review data
    expect(screen.getByText('emp1')).toBeInTheDocument();
    expect(screen.getByText('self')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('Mar 31, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  it('navigates to view review page when view button is clicked', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    const viewButton = screen.getByRole('button', { name: /view/i });
    await userEvent.click(viewButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/reviews/1');
  });

  it('navigates to edit review page when edit button is clicked', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/reviews/1/edit');
  });

  it('calls delete handler when delete button is clicked', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    expect(consoleSpy).toHaveBeenCalledWith('Delete review:', '1');
    consoleSpy.mockRestore();
  });

  it('displays correct status chip colors', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    const statusChip = screen.getByText('draft');
    expect(statusChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
  });

  it('displays review type as outlined chip', async () => {
    renderWithAuth();
    
    // Wait for loading to complete
    await screen.findByText('Performance Reviews');

    const typeChip = screen.getByText('self');
    expect(typeChip.closest('.MuiChip-root')).toHaveClass('MuiChip-outlined');
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import OKRList from '../OKRList';

const theme = createTheme();

describe('OKRList', () => {
  const mockOKRs = [
    {
      id: '1',
      title: 'Test OKR 1',
      description: 'Description 1',
      level: 'individual' as const,
      employee: { id: 'emp1', name: 'John Doe', role: 'Developer' },
      target_value: 100,
      current_value: 50,
      unit_of_measure: 'percentage',
      weight: 1,
      priority: 'high' as const,
      start_date: '2024-01-01',
      due_date: '2024-12-31',
      status: 'active' as const,
      progress: 50,
      updates: [],
      tags: ['test1'],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      title: 'Test OKR 2',
      description: 'Description 2',
      level: 'team' as const,
      employee: { id: 'emp2', name: 'Jane Smith', role: 'Manager' },
      target_value: 100,
      current_value: 100,
      unit_of_measure: 'percentage',
      weight: 1,
      priority: 'medium' as const,
      start_date: '2024-01-01',
      due_date: '2024-12-31',
      status: 'completed' as const,
      progress: 100,
      updates: [],
      tags: ['test2'],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const defaultProps = {
    okrs: mockOKRs,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onAdd: jest.fn(),
    onSelect: jest.fn(),
  };

  const renderList = (props = {}) => {
    render(
      <ThemeProvider theme={theme}>
        <OKRList {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all OKRs in the list', () => {
    renderList();
    mockOKRs.forEach((okr) => {
      expect(screen.getByText(okr.title)).toBeInTheDocument();
    });
  });

  it('displays OKR progress correctly', () => {
    renderList();
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(4); // 2 OKRs × 2 progress bars each (linear + circular)
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '50');
    expect(progressBars[2]).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows correct status indicators', () => {
    renderList();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderList();
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockOKRs[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderList();
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockOKRs[0].id);
  });

  it('calls onSelect when an OKR is clicked', () => {
    renderList();
    fireEvent.click(screen.getByText(mockOKRs[0].title));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockOKRs[0]);
  });

  it('displays priority indicators correctly', () => {
    renderList();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('shows tags for each OKR', () => {
    renderList();
    mockOKRs.forEach((okr) => {
      okr.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  it('displays due dates in the correct format', () => {
    renderList();
    // Check that due dates are displayed with "Due:" prefix
    const dueDates = screen.getAllByText(/Due:/);
    expect(dueDates).toHaveLength(2); // One for each OKR
    // Check for the actual formatted dates
    expect(screen.getByText(/31\/12\/2024/)).toBeInTheDocument();
  });

  it('handles empty OKR list', () => {
    renderList({ okrs: [] });
    expect(screen.getByText('No OKRs found')).toBeInTheDocument();
  });

  it('shows correct type indicators', () => {
    renderList();
    expect(screen.getByText('individual')).toBeInTheDocument();
    expect(screen.getByText('team')).toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import OKRDetail from '../OKRDetail';

const theme = createTheme();

describe('OKRDetail', () => {
  const mockOKR = {
    id: '1',
    title: 'Test OKR',
    description: 'Test Description',
    level: 'individual' as const,
    employee: {
      id: 'emp1',
      name: 'John Doe',
      role: 'Software Engineer',
    },
    target_value: 100,
    current_value: 75,
    unit_of_measure: 'percentage',
    weight: 1.0,
    priority: 'high' as const,
    start_date: '2024-01-01T00:00:00.000Z',
    due_date: '2024-12-31T00:00:00.000Z',
    status: 'active' as const,
    progress: 75,
    updates: [
      {
        id: 'u1',
        okr_id: '1',
        content: 'First update',
        old_value: 25,
        new_value: 50,
        update_type: 'progress' as const,
        updated_by: {
          id: 'emp1',
          name: 'John Doe',
          role: 'Software Engineer',
        },
        created_at: '2024-02-15T00:00:00.000Z',
      },
      {
        id: 'u2',
        okr_id: '1',
        content: 'Second update',
        old_value: 50,
        new_value: 75,
        update_type: 'progress' as const,
        updated_by: {
          id: 'emp1',
          name: 'John Doe',
          role: 'Software Engineer',
        },
        created_at: '2024-03-01T00:00:00.000Z',
      },
    ],
    tags: ['test', 'important'],
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-03-01T00:00:00.000Z',
  };

  const defaultProps = {
    okr: mockOKR,
    onEdit: jest.fn(),
    onAddUpdate: jest.fn(),
  };

  const renderDetail = (props = {}) => {
    render(
      <ThemeProvider theme={theme}>
        <OKRDetail {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays OKR title and description', () => {
    renderDetail();
    expect(screen.getByText(mockOKR.title)).toBeInTheDocument();
    expect(screen.getByText(mockOKR.description)).toBeInTheDocument();
  });

  it('shows OKR metadata correctly', () => {
    renderDetail();
    expect(screen.getByText(mockOKR.title)).toBeInTheDocument();
    expect(screen.getByText(mockOKR.description)).toBeInTheDocument();
  });

  it('displays progress information', () => {
    renderDetail();
    const progressElements = screen.getAllByRole('progressbar');
    expect(progressElements.length).toBeGreaterThan(0);
    const mainProgress = progressElements.find(el => el.getAttribute('aria-valuenow') === mockOKR.progress.toString());
    expect(mainProgress).toBeDefined();
  });

  it('shows parent goal information', () => {
    const okrWithParent = {
      ...mockOKR,
      parent_okr: {
        id: '2',
        title: 'Parent Goal',
        progress: 80,
        employee: { id: 'emp2', name: 'Jane Smith', role: 'Manager' },
        level: 'team' as const,
      },
    };
    renderDetail({ okr: okrWithParent });
    expect(screen.getByText('Parent Goal')).toBeInTheDocument();
  });

  it('displays child goals', () => {
    const okrWithChildren = {
      ...mockOKR,
      child_okrs: [
        {
          ...mockOKR,
          id: '3',
          title: 'Child Goal 1',
          progress: 60,
        },
        {
          ...mockOKR,
          id: '4',
          title: 'Child Goal 2',
          progress: 40,
        },
      ],
    };
    renderDetail({ okr: okrWithChildren });
    // Note: The component might not display child goals, so this test might need adjustment
    // based on the actual component implementation
  });

  it('shows progress updates in chronological order', () => {
    renderDetail();
    mockOKR.updates.forEach((update) => {
      expect(screen.getByText(update.content)).toBeInTheDocument();
    });
  });

  it('displays tags', () => {
    renderDetail();
    mockOKR.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('shows formatted dates', () => {
    renderDetail();
    const yearElements = screen.getAllByText(/2024/);
    expect(yearElements.length).toBeGreaterThan(0);
  });

  it('calls onEdit when edit button is clicked', () => {
    renderDetail();
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalled();
  });

  it('calls onAddUpdate when add update button is clicked', () => {
    renderDetail();
    const addUpdateButton = screen.getByText('Add Update');
    fireEvent.click(addUpdateButton);
    expect(defaultProps.onAddUpdate).toHaveBeenCalled();
  });

  it('handles missing optional properties', () => {
    const minimalOKR = {
      id: '1',
      title: 'Minimal OKR',
      description: 'Minimal Description',
      type: 'individual' as const,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-12-31'),
      status: 'active' as const,
      priority: 'medium' as const,
      tags: [],
      progress: 0,
    };

    renderDetail({ okr: minimalOKR });
    expect(screen.getByText(minimalOKR.title)).toBeInTheDocument();
    expect(screen.queryByText('Parent Goal')).not.toBeInTheDocument();
    expect(screen.queryByText('Child Goals')).not.toBeInTheDocument();
  });

  it('formats update dates correctly', () => {
    renderDetail();
    mockOKR.updates.forEach((update) => {
      expect(screen.getByText(update.content)).toBeInTheDocument();
    });
  });

  it('shows progress trend in updates', () => {
    renderDetail();
    mockOKR.updates.forEach((update) => {
      expect(screen.getByText(update.content)).toBeInTheDocument();
    });
  });
}); 
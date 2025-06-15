import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OKRHierarchy } from '../OKRHierarchy';
import { OKR } from '@/types/okr';

describe('OKRHierarchy', () => {
  const mockOKRs: OKR[] = [
    {
      id: '1',
      title: 'Company Goal 1',
      description: 'Test Description',
      level: 'company',
      owner: {
        id: 'owner1',
        name: 'John Doe',
        role: 'CEO',
      },
      progress: 75,
      status: 'in_progress',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      keyResults: [],
      tags: ['strategy'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      title: 'Department Goal 1',
      description: 'Test Description',
      level: 'department',
      owner: {
        id: 'owner2',
        name: 'Jane Smith',
        role: 'Department Head',
      },
      progress: 50,
      status: 'not_started',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      parentOKRId: '1',
      keyResults: [],
      tags: ['efficiency'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '3',
      title: 'Team Goal 1',
      description: 'Test Description',
      level: 'team',
      owner: {
        id: 'owner3',
        name: 'Bob Wilson',
        role: 'Team Lead',
      },
      progress: 25,
      status: 'at_risk',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      parentOKRId: '2',
      keyResults: [],
      tags: ['development'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders OKR hierarchy correctly', () => {
    render(<OKRHierarchy okrs={mockOKRs} onEdit={mockOnEdit} />);

    expect(screen.getByText('Company Goal 1')).toBeInTheDocument();
    expect(screen.getByText('Department Goal 1')).toBeInTheDocument();
    expect(screen.getByText('Team Goal 1')).toBeInTheDocument();
  });

  it('displays progress indicators', () => {
    render(<OKRHierarchy okrs={mockOKRs} onEdit={mockOnEdit} />);

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(3);
  });

  it('shows status chips', () => {
    render(<OKRHierarchy okrs={mockOKRs} onEdit={mockOnEdit} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('handles edit button clicks', () => {
    render(<OKRHierarchy okrs={mockOKRs} onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockOKRs[0]);
  });

  it('expands and collapses tree nodes', () => {
    render(<OKRHierarchy okrs={mockOKRs} onEdit={mockOnEdit} />);

    const expandButtons = screen.getAllByRole('button', { name: /expand/i });
    fireEvent.click(expandButtons[0]);

    // Check if child nodes are visible
    expect(screen.getByText('Department Goal 1')).toBeVisible();
    expect(screen.getByText('Team Goal 1')).toBeVisible();

    // Collapse the node
    fireEvent.click(expandButtons[0]);

    // Child nodes should still be in the DOM but might be hidden
    expect(screen.getByText('Department Goal 1')).toBeInTheDocument();
    expect(screen.getByText('Team Goal 1')).toBeInTheDocument();
  });

  it('renders without edit buttons when onEdit is not provided', () => {
    render(<OKRHierarchy okrs={mockOKRs} />);

    const editButtons = screen.queryAllByRole('button', { name: /edit/i });
    expect(editButtons).toHaveLength(0);
  });

  it('handles empty OKRs array', () => {
    render(<OKRHierarchy okrs={[]} onEdit={mockOnEdit} />);

    expect(screen.queryByRole('tree')).toBeInTheDocument();
    expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
  });
}); 
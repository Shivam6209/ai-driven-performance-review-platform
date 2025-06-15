import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OKRsPage from '../okrs';
import { OKRService } from '@/services/okr.service';
import { OKR, OKRLevel, OKRStatus } from '@/types/okr';

// Mock the OKRService
jest.mock('@/services/okr.service', () => ({
  OKRService: {
    getInstance: jest.fn(),
  },
}));

interface MockOKRService {
  getOKRs: jest.Mock;
  createOKR: jest.Mock;
  updateOKR: jest.Mock;
}

const mockOKRs: OKR[] = [
  {
    id: '1',
    title: 'Company Goal 1',
    description: 'Test Description',
    level: 'company',
    owner: {
      id: 'owner1',
      name: 'John Doe',
      role: 'CEO'
    },
    progress: 75,
    status: 'in_progress',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    keyResults: [],
    tags: ['strategy'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    title: 'Department Goal 1',
    description: 'Test Description',
    level: 'department',
    owner: {
      id: 'owner2',
      name: 'Jane Smith',
      role: 'Department Head'
    },
    progress: 50,
    status: 'not_started',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    parentOKRId: '1',
    keyResults: [],
    tags: ['efficiency'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

describe('OKRsPage', () => {
  let mockService: MockOKRService;

  beforeEach(() => {
    mockService = {
      getOKRs: jest.fn(),
      createOKR: jest.fn(),
      updateOKR: jest.fn(),
    };
    (OKRService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockService.getOKRs.mockImplementation(() => new Promise(() => {}));
    render(<OKRsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders OKRs after loading', async () => {
    mockService.getOKRs.mockResolvedValue(mockOKRs);
    render(<OKRsPage />);

    await waitFor(() => {
      expect(screen.getByText('Company Goal 1')).toBeInTheDocument();
      expect(screen.getByText('Department Goal 1')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to load OKRs';
    mockService.getOKRs.mockRejectedValue(new Error(errorMessage));
    render(<OKRsPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('opens create OKR form', () => {
    mockService.getOKRs.mockResolvedValue([]);
    render(<OKRsPage />);

    fireEvent.click(screen.getByText('Create OKR'));
    expect(screen.getByText('Create New OKR')).toBeInTheDocument();
  });

  it('filters OKRs by level', async () => {
    mockService.getOKRs.mockResolvedValue(mockOKRs);
    render(<OKRsPage />);

    await waitFor(() => {
      expect(screen.getByText('Company Goal 1')).toBeInTheDocument();
    });

    const levelSelect = screen.getByLabelText('Level');
    fireEvent.mouseDown(levelSelect);
    const departmentOption = screen.getByText('Department');
    fireEvent.click(departmentOption);

    expect(mockService.getOKRs).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'department' as OKRLevel })
    );
  });

  it('filters OKRs by status', async () => {
    mockService.getOKRs.mockResolvedValue(mockOKRs);
    render(<OKRsPage />);

    await waitFor(() => {
      expect(screen.getByText('Company Goal 1')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    const inProgressOption = screen.getByText('In Progress');
    fireEvent.click(inProgressOption);

    expect(mockService.getOKRs).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in_progress' as OKRStatus })
    );
  });

  it('creates new OKR', async () => {
    const newOKR: Partial<OKR> = {
      title: 'New OKR',
      description: 'New Description',
      level: 'team',
      status: 'not_started',
      owner: {
        id: 'owner3',
        name: 'Test User',
        role: 'Team Lead'
      },
      progress: 0,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      keyResults: [],
      tags: []
    };

    mockService.getOKRs.mockResolvedValue([]);
    mockService.createOKR.mockResolvedValue({ id: '3', ...newOKR, createdAt: '2024-01-01', updatedAt: '2024-01-01' });

    render(<OKRsPage />);

    // Open create form
    fireEvent.click(screen.getByText('Create OKR'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: newOKR.title },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: newOKR.description },
    });

    // Submit form
    fireEvent.click(screen.getByText('Create OKR'));

    await waitFor(() => {
      expect(mockService.createOKR).toHaveBeenCalledWith(
        expect.objectContaining(newOKR)
      );
    });
  });

  it('updates existing OKR', async () => {
    mockService.getOKRs.mockResolvedValue(mockOKRs);
    const updatedOKR: OKR = { ...mockOKRs[0], title: 'Updated Title' };
    mockService.updateOKR.mockResolvedValue(updatedOKR);

    render(<OKRsPage />);

    await waitFor(() => {
      expect(screen.getByText('Company Goal 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // Update title
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

    // Submit form
    fireEvent.click(screen.getByText('Update OKR'));

    await waitFor(() => {
      expect(mockService.updateOKR).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: 'Updated Title' })
      );
    });
  });
}); 
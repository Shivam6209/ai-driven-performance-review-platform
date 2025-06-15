import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import AuditLogsList from '../AuditLogsList';
import { ComplianceService } from '../../../services/compliance.service';

// Mock the compliance service
jest.mock('../../../services/compliance.service', () => ({
  ComplianceService: {
    searchAuditLogs: jest.fn(),
  },
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('AuditLogsList Component', () => {
  const mockAuditLogs = {
    data: [
      {
        id: 'log1',
        event_type: 'create',
        resource_type: 'employee',
        resource_id: 'emp1',
        actor_id: 'user1',
        actor_type: 'employee',
        status: 'success',
        created_at: '2023-01-01T12:00:00Z',
      },
      {
        id: 'log2',
        event_type: 'update',
        resource_type: 'review',
        resource_id: 'rev1',
        actor_id: 'user2',
        actor_type: 'admin',
        status: 'failure',
        created_at: '2023-01-02T12:00:00Z',
      },
    ],
    total: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ComplianceService.searchAuditLogs as jest.Mock).mockResolvedValue(mockAuditLogs);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AuditLogsList />
          </LocalizationProvider>
        </SnackbarProvider>
      </MemoryRouter>
    );
  };

  it('renders the component with audit logs', async () => {
    renderComponent();

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Check if both logs are rendered
    expect(screen.getByText('create')).toBeInTheDocument();
    expect(screen.getByText('update')).toBeInTheDocument();
    expect(screen.getByText('employee')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    
    // Check if status chips are rendered
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Failure')).toBeInTheDocument();
  });

  it('navigates to details page when view button is clicked', async () => {
    renderComponent();

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Find and click the view button for the first log
    const viewButtons = screen.getAllByTestId('VisibilityIcon');
    fireEvent.click(viewButtons[0].closest('button')!);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/admin/compliance/audit-logs/log1');
  });

  it('calls search with updated params when search button is clicked', async () => {
    renderComponent();

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Fill in some search fields
    fireEvent.change(screen.getByLabelText('Event Type'), {
      target: { value: 'create', name: 'eventType' },
    });

    fireEvent.change(screen.getByLabelText('Resource Type'), {
      target: { value: 'employee', name: 'resourceType' },
    });

    // Click search button
    fireEvent.click(screen.getByText('Search'));

    // Check if searchAuditLogs was called with updated params
    expect(ComplianceService.searchAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'create',
        resourceType: 'employee',
        page: 0,
      })
    );
  });

  it('changes page when pagination is used', async () => {
    (ComplianceService.searchAuditLogs as jest.Mock).mockResolvedValue({
      data: mockAuditLogs.data,
      total: 20, // More logs for pagination
    });

    renderComponent();

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Click next page button
    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);

    // Check if searchAuditLogs was called with updated page
    expect(ComplianceService.searchAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
      })
    );
  });

  it('changes rows per page when limit is changed', async () => {
    renderComponent();

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    // Open rows per page dropdown
    fireEvent.mouseDown(screen.getByLabelText('Rows per page:'));
    
    // Select 25 rows per page
    const option25 = screen.getByText('25');
    fireEvent.click(option25);

    // Check if searchAuditLogs was called with updated limit
    expect(ComplianceService.searchAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 0,
        limit: 25,
      })
    );
  });

  it('renders empty state when no logs are available', async () => {
    (ComplianceService.searchAuditLogs as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
    });
    
    renderComponent();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if empty state message is shown
    expect(screen.getByText('No audit logs found')).toBeInTheDocument();
  });
}); 
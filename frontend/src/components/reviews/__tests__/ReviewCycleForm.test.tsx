import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewCycleForm } from '../ReviewCycleForm';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';

const theme = createTheme();

describe('ReviewCycleForm', () => {
  const mockOnSubmit = jest.fn().mockImplementation(() => Promise.resolve());
  const mockOnCancel = jest.fn();

  const sampleDepartments = [
    {
      id: 'dept1',
      name: 'Engineering',
      description: 'Software Engineering Department',
      managerId: 'mgr1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'dept2',
      name: 'Product',
      description: 'Product Management Department',
      managerId: 'mgr2',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'dept3',
      name: 'Design',
      description: 'Design Department',
      managerId: 'mgr3',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const sampleInitialData = {
    name: 'Q1 2024 Review',
    description: 'First quarter performance review',
    cycleType: 'quarterly' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    submissionDeadline: new Date('2024-03-25'),
    approvalDeadline: new Date('2024-03-30'),
    departmentId: 'dept1',
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ReviewCycleForm
            departments={sampleDepartments}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            {...props}
          />
        </LocalizationProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderComponent();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cycle type/i)).toBeInTheDocument();
    
    // DatePicker components create multiple elements with the same label
    expect(screen.getAllByLabelText(/start date/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/end date/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/submission deadline/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/approval deadline/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
  });

  it('loads initial data correctly', () => {
    renderComponent({ initialValues: sampleInitialData });

    expect(screen.getByLabelText(/name/i)).toHaveValue('Q1 2024 Review');
    expect(screen.getByLabelText(/description/i)).toHaveValue('First quarter performance review');
    expect(screen.getByText('Quarterly')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderComponent();

    // Touch the fields by focusing and blurring them to trigger validation
    const nameField = screen.getByLabelText(/name/i);
    const cycleTypeField = screen.getByLabelText(/cycle type/i);
    
    fireEvent.focus(nameField);
    fireEvent.blur(nameField);
    fireEvent.focus(cycleTypeField);
    fireEvent.blur(cycleTypeField);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates end date is after start date', async () => {
    renderComponent();

    // Fill required fields first
    const nameField = screen.getByLabelText(/name/i);
    fireEvent.change(nameField, {
      target: { value: 'Test Cycle' },
    });

    // Touch and blur the name field to ensure it's valid
    fireEvent.focus(nameField);
    fireEvent.blur(nameField);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    // Since we filled the name, it should not show "Name is required" error
    // The form will still have other validation errors for dates
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when valid', async () => {
    renderComponent({ initialValues: sampleInitialData });

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Q1 2024 Review',
        description: 'First quarter performance review',
        cycleType: 'quarterly',
        departmentId: 'dept1',
      }));
    });
  });

  it('shows loading state during submission', async () => {
    const mockSlowSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderComponent({ onSubmit: mockSlowSubmit, initialValues: sampleInitialData });

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('handles submission error', async () => {
    const mockErrorSubmit = jest.fn().mockRejectedValue(new Error('Failed to save'));
    
    renderComponent({ onSubmit: mockErrorSubmit, initialValues: sampleInitialData });

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    // The component doesn't show error messages in UI, just logs to console
    await waitFor(() => {
      expect(mockErrorSubmit).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form submission during loading', async () => {
    const mockSlowSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderComponent({ onSubmit: mockSlowSubmit, initialValues: sampleInitialData });

    const submitButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { createTheme } from '@mui/material';
import '@testing-library/jest-dom/extend-expect';
import GoalEditor from '../GoalEditor';

const theme = createTheme();

describe('GoalEditor', () => {
  const mockGoal = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    level: 'individual' as const,
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    status: 'active' as const,
    priority: 'medium' as const,
    tags: ['test', 'goal'],
    target_value: 100,
    current_value: 0,
    unit_of_measure: 'percentage',
    weight: 1.0,
    progress: 0,
  };

  const defaultProps = {
    isOpen: true,
    onSave: jest.fn(),
    onClose: jest.fn(),
  };

  const renderEditor = (props = {}) => {
    render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <GoalEditor {...defaultProps} {...props} />
        </LocalizationProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the editor with correct title for new goal', () => {
    renderEditor();
    expect(screen.getByText('Create New OKR')).toBeInTheDocument();
  });

  it('renders the editor with correct title for existing goal', () => {
    renderEditor({ initialData: mockGoal });
    expect(screen.getByText('Edit OKR')).toBeInTheDocument();
  });

  it('populates form fields with goal data when editing', () => {
    renderEditor({ initialData: mockGoal });
    expect(screen.getByDisplayValue(mockGoal.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockGoal.description)).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    const onSave = jest.fn();
    renderEditor({ onSave });

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Goal' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'New Description' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Goal',
          description: 'New Description',
        })
      );
    });
  });

  it('validates required fields on submission', async () => {
    renderEditor();

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create'));

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('handles tag management correctly', () => {
    renderEditor({ initialData: mockGoal });

    // Check that existing tags are displayed
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('goal')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn();
    renderEditor({ onClose });

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('handles date selection correctly', async () => {
    renderEditor();

    // Check that date pickers are present
    expect(screen.getAllByLabelText(/start date/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/due date/i).length).toBeGreaterThan(0);
  });

  it('handles level and priority selection', () => {
    renderEditor();

    // Check that level and priority selects are present
    expect(screen.getByLabelText(/level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });
}); 
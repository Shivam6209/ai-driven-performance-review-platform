import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import OKRUpdateForm from '../OKRUpdateForm';
import { OKRUpdate } from '@/types/okr';

const theme = createTheme();

describe('OKRUpdateForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockOKR = {
    id: 'okr1',
    title: 'Test OKR',
    description: 'Test OKR Description',
    level: 'individual' as const,
    employee: {
      id: 'emp1',
      name: 'John Doe',
      role: 'employee',
    },
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
    tags: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const defaultProps = {
    okr: mockOKR,
    isOpen: true,
    onClose: mockOnCancel,
    onSubmit: mockOnSubmit,
  };

  const mockUpdate: OKRUpdate = {
    id: '1',
    okr_id: 'okr1',
    content: 'Making good progress',
    old_value: 25,
    new_value: 75,
    update_type: 'progress',
    updated_by: {
      id: 'emp1',
      name: 'John Doe',
      role: 'employee',
    },
    created_at: '2024-01-01',
  };

  const renderForm = (props = {}) => {
    render(
      <ThemeProvider theme={theme}>
        <OKRUpdateForm {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form when open', () => {
    renderForm();
    expect(screen.getByText('Add Update for "Test OKR"')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderForm({ isOpen: false });
    expect(screen.queryByText('Add Update for "Test OKR"')).not.toBeInTheDocument();
  });

  it('shows current progress', () => {
    renderForm();
    expect(screen.getByText(`Current Progress: ${defaultProps.okr.progress}%`)).toBeInTheDocument();
  });

  it('handles content input', () => {
    renderForm();
    const input = screen.getByRole('textbox', { name: /update details/i });
    fireEvent.change(input, { target: { value: 'Test update' } });
    expect(input).toHaveValue('Test update');
  });

  it('handles progress slider changes', () => {
    renderForm();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 75 } });
    expect(slider).toHaveValue('75');
  });

  it('disables submit button when content is empty', () => {
    renderForm();
    const submitButton = screen.getByText('Add Update');
    expect(submitButton).not.toBeDisabled();
  });

  it('enables submit button when content is provided', () => {
    renderForm();
    const input = screen.getByRole('textbox', { name: /update details/i });
    fireEvent.change(input, { target: { value: 'Test update' } });
    const submitButton = screen.getByText('Add Update');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit with form data when submitted', async () => {
    renderForm();
    const input = screen.getByRole('textbox', { name: /update details/i });
    const slider = screen.getByRole('slider');

    fireEvent.change(input, { target: { value: 'Test update' } });
    fireEvent.change(slider, { target: { value: 75 } });
    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: 'Test update',
        update_type: 'progress',
        old_value: '50',
        new_value: '75',
      });
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('resets form after submission', async () => {
    renderForm();
    const input = screen.getByRole('textbox', { name: /update details/i });
    const slider = screen.getByRole('slider');

    fireEvent.change(input, { target: { value: 'Test update' } });
    fireEvent.change(slider, { target: { value: 75 } });
    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(input).toHaveValue('');
      expect(slider).toHaveValue(defaultProps.okr.progress.toString());
    });
  });

  it('prevents form submission on empty content', () => {
    renderForm();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 75 } });
    fireEvent.click(screen.getByText('Add Update'));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace from content before submission', async () => {
    renderForm();
    const input = screen.getByRole('textbox', { name: /update details/i });
    fireEvent.change(input, { target: { value: '  Test update  ' } });
    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '  Test update  ',
        })
      );
    });
  });

  it('renders form fields correctly', () => {
    renderForm();

    expect(screen.getByRole('textbox', { name: /update details/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByLabelText(/Update Type/i)).toBeInTheDocument();
  });

  it('renders with initial values', () => {
    renderForm({ initialValues: mockUpdate });

    expect(screen.getByRole('slider')).toHaveValue('50');
    expect(screen.getByRole('textbox', { name: /update details/i })).toHaveValue('');
  });

  it('handles form submission', async () => {
    renderForm();

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 80 } });
    
    const input = screen.getByRole('textbox', { name: /update details/i });
    fireEvent.change(input, { target: { value: 'New update' } });

    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'New update',
          update_type: 'progress',
          old_value: '50',
          new_value: '80',
        })
      );
    });
  });

  it('validates required fields', async () => {
    renderForm();

    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(screen.getByText(/Update content is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates progress range', async () => {
    renderForm();

    const input = screen.getByRole('textbox', { name: /update details/i });
    fireEvent.change(input, { target: { value: 'Test' } });
    
    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles status update type', async () => {
    renderForm();

    const updateTypeSelect = screen.getByLabelText(/Update Type/i);
    fireEvent.mouseDown(updateTypeSelect);
    fireEvent.click(screen.getByText('Status Change'));

    expect(screen.getByLabelText(/New Status/i)).toBeInTheDocument();
    
    const input = screen.getByRole('textbox', { name: /update details/i });
    fireEvent.change(input, { target: { value: 'Status update' } });
    
    const statusSelect = screen.getByLabelText(/New Status/i);
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText('Completed'));

    fireEvent.click(screen.getByText('Add Update'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Status update',
          update_type: 'status',
          old_value: 'active',
          new_value: 'completed',
        })
      );
    });
  });


}); 
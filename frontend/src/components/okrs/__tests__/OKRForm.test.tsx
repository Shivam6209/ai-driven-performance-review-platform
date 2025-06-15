import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OKRForm from '../OKRForm';
import { OKR } from '@/types/okr';

const mockOKR: OKR = {
  id: '1',
  title: 'Test OKR',
  description: 'Test Description',
  level: 'individual',
  employee: {
    id: 'owner1',
    name: 'John Doe',
    role: 'Developer'
  },
  target_value: 100,
  current_value: 0,
  unit_of_measure: 'percentage',
  weight: 1,
  priority: 'medium',
  start_date: '2024-01-01',
  due_date: '2024-12-31',
  status: 'not_started',
  progress: 0,
  updates: [],
  tags: ['test', 'development'],
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
};

describe('OKRForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty form correctly', () => {
    render(
      <OKRForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(2); // Level and Status dropdowns
    expect(screen.getByText(/add key result/i)).toBeInTheDocument();
  });

  it('renders form with existing OKR data', () => {
    render(
      <OKRForm
        okr={mockOKR}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test OKR');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
  });

  it('handles tag addition and removal', () => {
    render(
      <OKRForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tagInput = screen.getByPlaceholderText(/add a tag/i);
    const addButton = screen.getByText(/add tag/i);

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'newtag' } });
    fireEvent.click(addButton);
    expect(screen.getByText('newtag')).toBeInTheDocument();

    // Remove the tag
    const deleteButton = screen.getByText('newtag').closest('div')?.querySelector('svg');
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(screen.queryByText('newtag')).not.toBeInTheDocument();
    }
  });

  it('handles key result addition and removal', () => {
    render(
      <OKRForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const addKeyResultButton = screen.getByText(/add key result/i);
    
    // Add a key result
    fireEvent.click(addKeyResultButton);
    expect(screen.getByText(/key result 1/i)).toBeInTheDocument();

    // Fill in key result details
    const titleInputs = screen.getAllByLabelText(/title/i);
    const keyResultTitleInput = titleInputs[1]; // Second title input is for key result
    fireEvent.change(keyResultTitleInput, { target: { value: 'Test KR' } });
    expect(keyResultTitleInput).toHaveValue('Test KR');

    // Remove the key result
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(screen.queryByText(/key result 1/i)).not.toBeInTheDocument();
  });

  it('submits form with correct data', () => {
    render(
      <OKRForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in form data
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New OKR' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Description' } });

    // Submit form
    const submitButton = screen.getByText(/create okr/i);
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New OKR',
      description: 'New Description',
      level: 'individual',
      status: 'not_started',
    }));
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <OKRForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 
 
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import FeedbackForm, { FeedbackData } from '../FeedbackForm';
import { aiService } from '@/services/ai.service';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the aiService
jest.mock('@/services/ai.service', () => ({
  aiService: {
    suggestFeedback: jest.fn().mockResolvedValue('This is an AI-generated feedback suggestion.'),
  },
}));

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    currentUser: { id: 'user1', firstName: 'Test', lastName: 'User' },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const theme = createTheme();

// Test data
const mockEmployees = [
  { id: 'emp1', name: 'John Doe' },
  { id: 'emp2', name: 'Jane Smith' },
];

const mockTags = ['Communication', 'Technical Skills', 'Teamwork', 'Leadership'];

const mockProjects = [
  { id: 'proj1', name: 'Website Redesign' },
  { id: 'proj2', name: 'Mobile App Development' },
];

const mockInitialData: Partial<FeedbackData> = {
  receiverId: 'emp1',
  content: 'Initial feedback content',
  visibility: 'public',
  tags: ['Communication'],
};

// Wrap component in ThemeProvider for tests
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('FeedbackForm', () => {
  const mockSubmit = jest.fn().mockImplementation(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all fields', () => {
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
      />
    );

    expect(screen.getByText('Provide Feedback')).toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Project (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getByText('Suggest Feedback')).toBeInTheDocument();
    expect(screen.getByText('Submit Feedback')).toBeInTheDocument();
  });

  test('loads initial data when provided', () => {
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    
    const textArea = screen.getByRole('textbox', { name: '' });
    expect(textArea).toHaveValue('Initial feedback content');
  });

  test('validates form before submission', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
      />
    );

    // Try to submit without selecting an employee
    await user.click(screen.getByText('Submit Feedback'));
    
    // Check for validation error
    expect(screen.getByText('Please select an employee')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
        initialData={mockInitialData}
      />
    );

    // Submit the form with valid data
    await user.click(screen.getByText('Submit Feedback'));
    
    // Check that onSubmit was called with the correct data
    expect(mockSubmit).toHaveBeenCalledWith({
      receiverId: 'emp1',
      content: 'Initial feedback content',
      visibility: 'public',
      tags: ['Communication'],
      projectId: undefined,
    });
  });

  test('generates AI suggestion when requested', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
        initialData={mockInitialData}
      />
    );

    // Click the suggest feedback button
    await user.click(screen.getByText('Suggest Feedback'));
    
    // Wait for the AI suggestion to appear
    await waitFor(() => {
      expect(screen.getByText('This is an AI-generated feedback suggestion.')).toBeInTheDocument();
    });
    
    // Check that aiService.suggestFeedback was called with correct parameters
    expect(aiService.suggestFeedback).toHaveBeenCalledWith(
      'user1',
      'emp1',
      'Focus on these areas: Communication'
    );
  });

  test('applies AI suggestion when "Use Suggestion" is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
        initialData={mockInitialData}
      />
    );

    // Generate AI suggestion
    await user.click(screen.getByText('Suggest Feedback'));
    
    // Wait for the suggestion to appear
    await waitFor(() => {
      expect(screen.getByText('This is an AI-generated feedback suggestion.')).toBeInTheDocument();
    });
    
    // Click "Use Suggestion"
    await user.click(screen.getByText('Use Suggestion'));
    
    // Check that the suggestion was applied to the textarea
    const textArea = screen.getByRole('textbox', { name: '' });
    expect(textArea).toHaveValue('This is an AI-generated feedback suggestion.');
  });

  test('resets form after successful submission', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FeedbackForm
        onSubmit={mockSubmit}
        availableEmployees={mockEmployees}
        availableTags={mockTags}
        availableProjects={mockProjects}
        initialData={mockInitialData}
      />
    );

    // Submit the form
    await user.click(screen.getByText('Submit Feedback'));
    
    // Wait for the form to reset
    await waitFor(() => {
      const textArea = screen.getByRole('textbox', { name: '' });
      expect(textArea).toHaveValue('');
    });
    
    // Check that other fields were reset
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Communication')).not.toBeInTheDocument();
  });
}); 
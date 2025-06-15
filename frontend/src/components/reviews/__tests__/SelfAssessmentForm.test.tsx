import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelfAssessmentForm, SelfAssessmentFormData } from '../SelfAssessmentForm';
import { QueryClient, QueryClientProvider } from 'react-query';
import { reviewsService } from '../../../services/reviewsService';
import { aiService } from '../../../services/aiService';
import { okrService } from '../../../services/okrService';

// Mock the services
jest.mock('../../../services/reviewsService');
jest.mock('../../../services/aiService');
jest.mock('../../../services/okrService');

describe('SelfAssessmentForm', () => {
  const mockEmployeeId = 'emp-123';
  const mockReviewCycleId = 'cycle-456';
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  
  const mockOkrs = [
    { id: 'okr1', title: 'Improve coding skills', progress: 75 },
    { id: 'okr2', title: 'Complete project X', progress: 90 },
  ];
  
  const mockFeedback = [
    { id: 'fb1', content: 'Great job on project X', type: 'positive' },
    { id: 'fb2', content: 'Could improve communication', type: 'constructive' },
  ];
  
  const mockAiSuggestions: Partial<SelfAssessmentFormData> = {
    achievements: 'Successfully completed Project X ahead of schedule.',
    challenges: 'Faced technical challenges with the new framework.',
    skillsGained: 'Improved React and TypeScript skills.',
    goalsProgress: 'Achieved 85% of set goals for the period.',
    improvementAreas: 'Communication with cross-functional teams.',
  };
  
  // Set up query client for tests
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service responses
    (okrService.getEmployeeOkrsForReviewCycle as jest.Mock).mockResolvedValue(mockOkrs);
    (reviewsService.getEmployeeFeedbackForReviewCycle as jest.Mock).mockResolvedValue(mockFeedback);
    (aiService.generateSelfAssessmentSuggestions as jest.Mock).mockResolvedValue(mockAiSuggestions);
  });
  
  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SelfAssessmentForm
          employeeId={mockEmployeeId}
          reviewCycleId={mockReviewCycleId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          {...props}
        />
      </QueryClientProvider>
    );
  };
  
  test('renders the component with loading state', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('renders form fields when data is loaded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Self-Assessment')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Your OKRs for this Review Period')).toBeInTheDocument();
    expect(screen.getByText('Improve coding skills')).toBeInTheDocument();
    expect(screen.getByText('Complete project X')).toBeInTheDocument();
    
    expect(screen.getByText('Key Achievements')).toBeInTheDocument();
    expect(screen.getByText('Challenges Faced')).toBeInTheDocument();
    expect(screen.getByText('Skills Gained or Improved')).toBeInTheDocument();
    expect(screen.getByText('Goals Progress')).toBeInTheDocument();
    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
    expect(screen.getByText('Overall Self Rating')).toBeInTheDocument();
  });
  
  test('submits form with entered data', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Key Achievements')).toBeInTheDocument();
    });
    
    // Fill in required fields
    const achievementsField = screen.getByPlaceholderText('Describe your key achievements during this review period...');
    const goalsProgressField = screen.getByPlaceholderText('Describe your progress on goals set for this period...');
    
    fireEvent.change(achievementsField, {
      target: { value: 'Completed all projects on time' },
    });
    
    fireEvent.change(goalsProgressField, {
      target: { value: 'Achieved 90% of my goals' },
    });
    
    // Wait for form to update
    await waitFor(() => {
      expect(achievementsField).toHaveValue('Completed all projects on time');
      expect(goalsProgressField).toHaveValue('Achieved 90% of my goals');
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Self-Assessment'));
    
    // Wait for submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          achievements: 'Completed all projects on time',
          goalsProgress: 'Achieved 90% of my goals',
        })
      );
    });
  });
  
  test('calls onCancel when cancel button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  test('generates and applies AI suggestions', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Generate AI Draft')).toBeInTheDocument();
    });
    
    // Click generate button
    fireEvent.click(screen.getByText('Generate AI Draft'));
    
    // Wait for AI generation to complete
    await waitFor(() => {
      expect(screen.getByText('Apply AI Suggestions')).toBeInTheDocument();
    });
    
    // Click apply button
    fireEvent.click(screen.getByText('Apply AI Suggestions'));
    
    // Verify AI suggestions were applied
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Describe your key achievements during this review period...')).toHaveValue(
        mockAiSuggestions.achievements!
      );
      expect(screen.getByPlaceholderText('Describe your progress on goals set for this period...')).toHaveValue(
        mockAiSuggestions.goalsProgress!
      );
    });
  });
  
  test('shows validation errors for required fields', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Submit Self-Assessment')).toBeInTheDocument();
    });
    
    // Submit without filling required fields
    fireEvent.click(screen.getByText('Submit Self-Assessment'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getAllByText('This field is required')).toHaveLength(2);
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewApprovalProcess } from '../ReviewApprovalProcess';
import { QueryClient, QueryClientProvider } from 'react-query';
import { reviewsService } from '../../../services/reviewsService';

// Mock the services
jest.mock('../../../services/reviewsService');

describe('ReviewApprovalProcess', () => {
  const mockReviewId = 'review-123';
  const mockEmployeeId = 'emp-456';
  const mockManagerId = 'emp-789';
  const mockOnComplete = jest.fn();
  
  const mockReviewData = {
    id: mockReviewId,
    employeeId: mockEmployeeId,
    employeeName: 'John Doe',
    managerId: mockManagerId,
    managerName: 'Jane Manager',
    reviewCycleId: 'cycle-456',
    reviewCycleName: 'Q2 2023 Performance Review',
    status: 'manager_review_pending',
    currentStep: 1,
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-10T14:30:00Z',
    dueDate: '2023-06-30T23:59:59Z',
    content: {
      selfAssessment: {
        achievements: 'Completed Project X ahead of schedule.',
        challenges: 'Faced technical challenges with new framework.',
        skillsGained: 'Improved React and TypeScript skills.',
        goalsProgress: 'Achieved 85% of set goals for the period.',
        improvementAreas: 'Communication with cross-functional teams.',
        overallRating: 4,
      },
      managerAssessment: {
        strengths: 'Strong technical skills and problem-solving abilities.',
        areasForImprovement: 'Could improve documentation and knowledge sharing.',
        goalAssessment: 'Met most goals with high quality results.',
        skillsAssessment: 'Demonstrated growth in technical and soft skills.',
        overallFeedback: 'Consistently delivers high-quality work.',
        performanceRating: 4,
      },
      peerReviews: [
        {
          id: 'peer-review-1',
          reviewerName: 'Alice Teammate',
          content: {
            strengths: 'Great collaborator and problem solver.',
            improvements: 'Sometimes takes on too much work.',
            collaboration: 'Always helpful and supportive.',
            overall: 'Excellent team member.',
          },
        },
      ],
    },
    history: [
      {
        timestamp: '2023-06-01T10:00:00Z',
        action: 'created the review',
        actorId: 'hr-123',
        actorName: 'HR Admin',
      },
      {
        timestamp: '2023-06-05T11:30:00Z',
        action: 'submitted self-assessment',
        actorId: mockEmployeeId,
        actorName: 'John Doe',
      },
      {
        timestamp: '2023-06-10T14:30:00Z',
        action: 'started manager review',
        actorId: mockManagerId,
        actorName: 'Jane Manager',
      },
    ],
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
    (reviewsService.getReviewById as jest.Mock).mockResolvedValue(mockReviewData);
    (reviewsService.updateReviewStatus as jest.Mock).mockResolvedValue({ success: true });
    (reviewsService.submitManagerAssessment as jest.Mock).mockResolvedValue({ success: true });
    (reviewsService.submitEmployeeAcknowledgment as jest.Mock).mockResolvedValue({ success: true });
    (reviewsService.submitHrNotes as jest.Mock).mockResolvedValue({ success: true });
  });
  
  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ReviewApprovalProcess
          reviewId={mockReviewId}
          employeeId={mockEmployeeId}
          managerId={mockManagerId}
          onComplete={mockOnComplete}
          {...props}
        />
      </QueryClientProvider>
    );
  };
  
  test('renders the component with loading state', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('renders review data when loaded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Review Approval Process')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Manager')).toBeInTheDocument();
    expect(screen.getByText('Q2 2023 Performance Review')).toBeInTheDocument();
  });
  
  test('displays the correct active step', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Manager Review')).toBeInTheDocument();
    });
    
    // The Self-Assessment step should be completed
    expect(screen.getByText('Self-Assessment')).toBeInTheDocument();
    expect(screen.getByText('Completed Project X ahead of schedule.')).toBeInTheDocument();
    
    // The Manager Review step should be active
    expect(screen.getByText('Manager reviews and provides feedback')).toBeInTheDocument();
  });
  
  test('manager can submit review for employee acknowledgment', async () => {
    renderComponent({ isManager: true });
    
    await waitFor(() => {
      expect(screen.getByText('Submit for Employee Acknowledgment')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Submit for Employee Acknowledgment'));
    
    await waitFor(() => {
      expect(reviewsService.updateReviewStatus).toHaveBeenCalledWith(
        mockReviewId,
        'employee_acknowledgment_pending',
        undefined
      );
    });
  });
  
  test('employee can acknowledge review', async () => {
    // Set up a different mock for this test
    const employeeAcknowledgmentMock = {
      ...mockReviewData,
      status: 'employee_acknowledgment_pending',
      currentStep: 2,
    };
    (reviewsService.getReviewById as jest.Mock).mockResolvedValue(employeeAcknowledgmentMock);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Acknowledge Review')).toBeInTheDocument();
    });
    
    // Add a comment
    fireEvent.change(screen.getByLabelText('Comments (Optional)'), {
      target: { value: 'I agree with this assessment.' },
    });
    
    // Click acknowledge
    fireEvent.click(screen.getByText('Acknowledge Review'));
    
    await waitFor(() => {
      expect(reviewsService.submitEmployeeAcknowledgment).toHaveBeenCalledWith(
        mockReviewId,
        true,
        'I agree with this assessment.'
      );
    });
  });
  
  test('employee can request discussion', async () => {
    // Set up a different mock for this test
    const employeeAcknowledgmentMock = {
      ...mockReviewData,
      status: 'employee_acknowledgment_pending',
      currentStep: 2,
    };
    (reviewsService.getReviewById as jest.Mock).mockResolvedValue(employeeAcknowledgmentMock);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Request Discussion')).toBeInTheDocument();
    });
    
    // Add a comment
    fireEvent.change(screen.getByLabelText('Comments (Optional)'), {
      target: { value: 'I would like to discuss some points further.' },
    });
    
    // Click request discussion
    fireEvent.click(screen.getByText('Request Discussion'));
    
    await waitFor(() => {
      expect(reviewsService.submitEmployeeAcknowledgment).toHaveBeenCalledWith(
        mockReviewId,
        false,
        'I would like to discuss some points further.'
      );
    });
  });
  
  test('HR can add HR notes', async () => {
    // Set up a different mock for this test
    const completedReviewMock = {
      ...mockReviewData,
      status: 'completed',
      currentStep: 3,
      completedAt: '2023-06-20T15:45:00Z',
      content: {
        ...mockReviewData.content,
        employeeAcknowledgment: {
          acknowledged: true,
          comments: 'Thank you for the feedback.',
          acknowledgedAt: '2023-06-15T09:30:00Z',
        },
      },
    };
    (reviewsService.getReviewById as jest.Mock).mockResolvedValue(completedReviewMock);
    
    renderComponent({ isHR: true });
    
    // Wait for the component to load - it should automatically show the completed step
    await waitFor(() => {
      expect(screen.getByText('Review Approval Process')).toBeInTheDocument();
      expect(screen.getByText(/This review has been completed on/)).toBeInTheDocument();
    });
    
    // Add HR notes
    fireEvent.change(screen.getByPlaceholderText('Add HR notes for this review (visible to HR only)...'), {
      target: { value: 'Employee is performing well and is on track for promotion.' },
    });
    
    // Save HR notes
    fireEvent.click(screen.getByText('Save HR Notes'));
    
    await waitFor(() => {
      expect(reviewsService.submitHrNotes).toHaveBeenCalledWith(
        mockReviewId,
        'Employee is performing well and is on track for promotion.'
      );
    });
  });
  
  test('user can view review history', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('HistoryIcon')).toBeInTheDocument();
    });
    
    // Open history dialog
    fireEvent.click(screen.getByTestId('HistoryIcon'));
    
    await waitFor(() => {
      expect(screen.getByText('Review History')).toBeInTheDocument();
    });
    
    // Check history entries - look for specific history actions
    expect(screen.getByText('created the review')).toBeInTheDocument();
    expect(screen.getByText('submitted self-assessment')).toBeInTheDocument();
    expect(screen.getByText('started manager review')).toBeInTheDocument();
    
    // Check that all actor names appear in the history dialog
    const hrAdminElements = screen.getAllByText('HR Admin');
    const johnDoeElements = screen.getAllByText('John Doe');
    const janeManagerElements = screen.getAllByText('Jane Manager');
    
    expect(hrAdminElements.length).toBeGreaterThan(0);
    expect(johnDoeElements.length).toBeGreaterThan(0);
    expect(janeManagerElements.length).toBeGreaterThan(0);
    
    // Close dialog
    fireEvent.click(screen.getByText('Close'));
    
    await waitFor(() => {
      expect(screen.queryByText('Review History')).not.toBeInTheDocument();
    });
  });
  
  test('handles error state when loading review fails', async () => {
    (reviewsService.getReviewById as jest.Mock).mockRejectedValue(new Error('Failed to load review'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error loading review data. Please try again.')).toBeInTheDocument();
    });
  });
}); 
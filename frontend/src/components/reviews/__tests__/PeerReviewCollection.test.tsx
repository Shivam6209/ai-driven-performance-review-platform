import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PeerReviewCollection } from '../PeerReviewCollection';
import { QueryClient, QueryClientProvider } from 'react-query';
import { reviewsService } from '../../../services/reviewsService';
import { employeeService } from '../../../services/employeeService';
import { aiService } from '../../../services/aiService';

// Mock the services
jest.mock('../../../services/reviewsService');
jest.mock('../../../services/employeeService');
jest.mock('../../../services/aiService');

describe('PeerReviewCollection', () => {
  const mockEmployeeId = 'emp-123';
  const mockReviewCycleId = 'cycle-456';
  const mockManagerId = 'emp-789';
  
  const mockPeerReviews = [
    {
      id: 'review-1',
      reviewerId: 'emp-456',
      reviewerName: 'Jane Smith',
      reviewerRole: 'Developer',
      status: 'pending',
    },
    {
      id: 'review-2',
      reviewerId: 'emp-789',
      reviewerName: 'John Manager',
      reviewerRole: 'Engineering Manager',
      status: 'pending',
    },
    {
      id: 'review-3',
      reviewerId: 'emp-101',
      reviewerName: 'Alice Cooper',
      reviewerRole: 'QA Engineer',
      status: 'submitted',
      submittedAt: '2023-06-15T10:30:00Z',
      content: {
        strengths: 'Great problem solver and team player.',
        improvements: 'Could improve documentation skills.',
        collaboration: 'Works well with the team.',
        overall: 'Strong performer who consistently delivers quality work.',
      },
    },
    {
      id: 'review-4',
      reviewerId: 'emp-202',
      reviewerName: 'Bob Johnson',
      reviewerRole: 'Product Manager',
      status: 'approved',
      submittedAt: '2023-06-14T09:15:00Z',
      content: {
        strengths: 'Excellent communication and technical skills.',
        improvements: 'Sometimes takes on too much work.',
        collaboration: 'Great collaborator who helps others.',
        overall: 'Exceptional team member who consistently exceeds expectations.',
      },
    },
  ];
  
  const mockAvailablePeers = [
    {
      id: 'emp-303',
      name: 'Charlie Brown',
      role: 'Senior Developer',
      department: 'Engineering',
    },
    {
      id: 'emp-404',
      name: 'Diana Prince',
      role: 'UX Designer',
      department: 'Design',
    },
    {
      id: 'emp-505',
      name: 'Edward Norton',
      role: 'Data Scientist',
      department: 'Data',
    },
  ];
  
  const mockAiSuggestions = {
    strengths: 'Demonstrates strong technical skills and problem-solving abilities.',
    improvements: 'Could benefit from improving presentation skills.',
    collaboration: 'Works well with team members and is always willing to help.',
    overall: 'A valuable team member who consistently delivers high-quality work.',
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
    (reviewsService.getPeerReviews as jest.Mock).mockResolvedValue(mockPeerReviews);
    (employeeService.getAvailablePeersForReview as jest.Mock).mockResolvedValue(mockAvailablePeers);
    (aiService.generatePeerReviewSuggestions as jest.Mock).mockResolvedValue(mockAiSuggestions);
    (reviewsService.requestPeerReviews as jest.Mock).mockResolvedValue({ success: true });
    (reviewsService.submitPeerReview as jest.Mock).mockResolvedValue({ success: true });
    (reviewsService.updatePeerReviewStatus as jest.Mock).mockResolvedValue({ success: true });
  });
  
  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PeerReviewCollection
          employeeId={mockEmployeeId}
          reviewCycleId={mockReviewCycleId}
          {...props}
        />
      </QueryClientProvider>
    );
  };
  
  test('renders the component with loading state', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('renders peer reviews when data is loaded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Peer Reviews')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('John Manager')).toBeInTheDocument();
    
    expect(screen.getByText('Submitted Reviews')).toBeInTheDocument();
    expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
    
    expect(screen.getByText('Completed Reviews')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });
  
  test('manager can request peer reviews', async () => {
    renderComponent({ managerId: mockManagerId, isManager: true });
    
    await waitFor(() => {
      expect(screen.getByText('Request Reviews')).toBeInTheDocument();
    });
    
    // Open request dialog
    fireEvent.click(screen.getByText('Request Reviews'));
    
    await waitFor(() => {
      expect(screen.getByText('Request Peer Reviews')).toBeInTheDocument();
    });
    
    // Select peers
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    expect(screen.getByText('Diana Prince')).toBeInTheDocument();
    
    // Select a peer
    const addButtons = screen.getAllByTestId('AddIcon');
    fireEvent.click(addButtons[0]); // Select Charlie Brown
    
    // Send request
    fireEvent.click(screen.getByText('Send Requests'));
    
    await waitFor(() => {
      expect(reviewsService.requestPeerReviews).toHaveBeenCalledWith(
        mockEmployeeId,
        mockReviewCycleId,
        expect.arrayContaining(['emp-303'])
      );
    });
  });
  
  test('manager can view and approve submitted reviews', async () => {
    renderComponent({ managerId: mockManagerId, isManager: true });
    
    await waitFor(() => {
      expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
    });
    
    // View submitted review
    const viewButtons = screen.getAllByText('View Full Review');
    fireEvent.click(viewButtons[0]); // View Alice Cooper's review
    
    await waitFor(() => {
      expect(screen.getByText('Strong performer who consistently delivers quality work.')).toBeInTheDocument();
    });
    
    // Approve review
    fireEvent.click(screen.getByText('Approve'));
    
    await waitFor(() => {
      expect(reviewsService.updatePeerReviewStatus).toHaveBeenCalledWith(
        'review-3',
        'approved'
      );
    });
  });
  
  test('reviewer can submit a peer review', async () => {
    renderComponent({ managerId: mockManagerId });
    
    await waitFor(() => {
      expect(screen.getByText('John Manager')).toBeInTheDocument();
    });
    
    // Find the review for the current manager
    const reviewButtons = screen.getAllByText('View');
    fireEvent.click(reviewButtons[1]); // Assuming the second one is for John Manager
    
    await waitFor(() => {
      expect(screen.getByText('Provide Peer Review')).toBeInTheDocument();
    });
    
    // Generate AI suggestions
    fireEvent.click(screen.getByText('Generate AI Draft'));
    
    await waitFor(() => {
      expect(aiService.generatePeerReviewSuggestions).toHaveBeenCalled();
    });
    
    // Fill in review form (AI suggestions should be applied automatically)
    const strengthsField = screen.getByLabelText('Strengths');
    const overallField = screen.getByLabelText('Overall Assessment');
    
    fireEvent.change(strengthsField, { target: { value: 'Great technical skills and attitude.' } });
    fireEvent.change(overallField, { target: { value: 'Excellent team member.' } });
    
    // Submit review
    fireEvent.click(screen.getByText('Submit Review'));
    
    await waitFor(() => {
      expect(reviewsService.submitPeerReview).toHaveBeenCalledWith(
        'review-2',
        expect.objectContaining({
          strengths: 'Great technical skills and attitude.',
          overall: 'Excellent team member.',
        })
      );
    });
  });
  
  test('displays empty state when no reviews are available', async () => {
    (reviewsService.getPeerReviews as jest.Mock).mockResolvedValue([]);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No peer reviews have been requested yet.')).toBeInTheDocument();
    });
  });
  
  test('handles error state when loading reviews fails', async () => {
    (reviewsService.getPeerReviews as jest.Mock).mockRejectedValue(new Error('Failed to load reviews'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error loading peer reviews. Please try again.')).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackTimeline, FeedbackItem } from '../FeedbackTimeline';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

describe('FeedbackTimeline', () => {
  const mockOnReactionClick = jest.fn();
  
  const sampleFeedback: FeedbackItem[] = [
    {
      id: '1',
      content: 'Great work on the presentation!',
      giverName: 'John Doe',
      receiverName: 'Jane Smith',
      feedbackType: 'appreciation',
      visibility: 'public',
      createdAt: '2024-02-20T10:00:00Z',
      reactions: [
        { type: 'helpful', count: 2 },
        { type: 'insightful', count: 1 },
        { type: 'actionable', count: 0 },
      ],
      sentimentScore: 0.8,
    },
    {
      id: '2',
      content: 'Consider improving the documentation.',
      giverName: 'Alice Brown',
      receiverName: 'Bob Wilson',
      feedbackType: 'constructive',
      visibility: 'private',
      createdAt: '2024-02-19T15:30:00Z',
      reactions: [
        { type: 'helpful', count: 1 },
        { type: 'insightful', count: 3 },
        { type: 'actionable', count: 2 },
      ],
      sentimentScore: 0.2,
    },
  ];

  const defaultProps = {
    feedback: sampleFeedback,
    onReactionClick: mockOnReactionClick,
  };

  const renderComponent = (props = defaultProps) => {
    return render(
      <ThemeProvider theme={theme}>
        <FeedbackTimeline {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all feedback items', () => {
    renderComponent();
    
    expect(screen.getByText('Great work on the presentation!')).toBeInTheDocument();
    expect(screen.getByText('Consider improving the documentation.')).toBeInTheDocument();
  });

  it('displays feedback metadata correctly', () => {
    renderComponent();
    
    expect(screen.getByText('From: John Doe')).toBeInTheDocument();
    expect(screen.getByText('To: Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('From: Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('To: Bob Wilson')).toBeInTheDocument();
  });

  it('shows correct feedback types', () => {
    renderComponent();
    
    expect(screen.getByText('appreciation')).toBeInTheDocument();
    expect(screen.getByText('constructive')).toBeInTheDocument();
  });

  it('displays sentiment scores', () => {
    renderComponent();
    
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('shows reaction counts', () => {
    renderComponent();
    
    expect(screen.getByText('2 helpful')).toBeInTheDocument();
    expect(screen.getByText('1 insightful')).toBeInTheDocument();
    expect(screen.getByText('3 insightful')).toBeInTheDocument();
    expect(screen.getByText('2 actionable')).toBeInTheDocument();
  });

  it('calls onReactionClick when reaction buttons are clicked', () => {
    renderComponent();
    
    const helpfulButtons = screen.getAllByTitle('Helpful');
    fireEvent.click(helpfulButtons[0]);
    
    expect(mockOnReactionClick).toHaveBeenCalledWith('1', 'helpful');
  });

  it('formats dates correctly', () => {
    renderComponent();
    
    // Note: This test might need adjustment based on the user's locale
    expect(screen.getByText('Feb 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('Feb 19, 2024')).toBeInTheDocument();
  });

  it('renders empty state when no feedback is provided', () => {
    renderComponent({ feedback: [], onReactionClick: mockOnReactionClick });
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeedbackSentimentAnalysis from '../FeedbackSentimentAnalysis';
import { sentimentService, SentimentAnalysisResult } from '@/services/sentiment.service';

// Mock the sentiment service
jest.mock('@/services/sentiment.service', () => ({
  sentimentService: {
    analyzeFeedback: jest.fn(),
  },
  SentimentType: {},
  FeedbackQuality: {},
}));

describe('FeedbackSentimentAnalysis', () => {
  const mockAnalysisResult: SentimentAnalysisResult = {
    sentiment: 'positive',
    score: 0.85,
    quality: 'high',
    qualityScore: 0.9,
    specificity: 0.8,
    actionability: 0.75,
    biasDetected: false,
    keywords: ['communication', 'teamwork', 'leadership'],
    summary: 'Great work on the project, especially with team communication.',
  };

  const mockBiasedAnalysisResult: SentimentAnalysisResult = {
    ...mockAnalysisResult,
    sentiment: 'concerning',
    score: 0.3,
    quality: 'low',
    qualityScore: 0.4,
    biasDetected: true,
    biasExplanation: 'Potential gender bias detected in language.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no analysis is available', () => {
    const { container } = render(<FeedbackSentimentAnalysis content="Good feedback" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state during analysis', async () => {
    (sentimentService.analyzeFeedback as jest.Mock).mockImplementation(() => new Promise(resolve => {
      // Never resolve to keep the loading state
      setTimeout(() => resolve(mockAnalysisResult), 10000);
    }));

    render(<FeedbackSentimentAnalysis content="Good feedback" autoAnalyze={true} />);
    
    expect(screen.getByText('Analyzing feedback...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when analysis fails', async () => {
    const errorMessage = 'API error occurred';
    (sentimentService.analyzeFeedback as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<FeedbackSentimentAnalysis content="Good feedback" autoAnalyze={true} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays sentiment analysis results correctly', async () => {
    (sentimentService.analyzeFeedback as jest.Mock).mockResolvedValue(mockAnalysisResult);

    render(<FeedbackSentimentAnalysis content="Good feedback" autoAnalyze={true} />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Analysis')).toBeInTheDocument();
      expect(screen.getByText(/Positive/)).toBeInTheDocument();
      expect(screen.getByText('Feedback Quality')).toBeInTheDocument();
    });
  });

  it('shows bias warning when bias is detected', async () => {
    (sentimentService.analyzeFeedback as jest.Mock).mockResolvedValue(mockBiasedAnalysisResult);

    render(<FeedbackSentimentAnalysis content="Potentially biased feedback" autoAnalyze={true} />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Analysis')).toBeInTheDocument();
    });

    // Click to show details
    fireEvent.click(screen.getByText('Detailed Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Potential Bias Detected')).toBeInTheDocument();
      expect(screen.getByText('Potential gender bias detected in language.')).toBeInTheDocument();
    });
  });

  it('toggles detailed analysis view when clicked', async () => {
    (sentimentService.analyzeFeedback as jest.Mock).mockResolvedValue(mockAnalysisResult);

    render(<FeedbackSentimentAnalysis content="Good feedback" autoAnalyze={true} />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Analysis')).toBeInTheDocument();
    });

    // Initially details should be hidden
    expect(screen.queryByText('Key Points')).not.toBeInTheDocument();

    // Click to show details
    fireEvent.click(screen.getByText('Detailed Analysis'));

    // Now details should be visible
    await waitFor(() => {
      expect(screen.getByText('Key Points')).toBeInTheDocument();
      expect(screen.getByText('Great work on the project, especially with team communication.')).toBeInTheDocument();
    });

    // Click to hide details
    fireEvent.click(screen.getByText('Detailed Analysis'));

    // Details should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Key Points')).not.toBeInTheDocument();
    });
  });

  it('calls onAnalysisComplete callback when analysis completes', async () => {
    (sentimentService.analyzeFeedback as jest.Mock).mockResolvedValue(mockAnalysisResult);
    const onAnalysisComplete = jest.fn();

    render(
      <FeedbackSentimentAnalysis 
        content="Good feedback" 
        autoAnalyze={true}
        onAnalysisComplete={onAnalysisComplete}
      />
    );

    await waitFor(() => {
      expect(onAnalysisComplete).toHaveBeenCalledWith(mockAnalysisResult);
    });
  });

  it('does not auto-analyze when content is too short', async () => {
    render(<FeedbackSentimentAnalysis content="Short" autoAnalyze={true} />);
    
    expect(sentimentService.analyzeFeedback).not.toHaveBeenCalled();
  });
}); 
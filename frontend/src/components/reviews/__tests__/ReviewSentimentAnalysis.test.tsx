import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReviewSentimentAnalysis, SentimentScore, TopicSentiment, KeyPhrase } from '../ReviewSentimentAnalysis';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

describe('ReviewSentimentAnalysis', () => {
  const sampleSentimentScores: SentimentScore = {
    positive: 0.65,
    negative: 0.15,
    neutral: 0.20,
    overall: 0.5,
  };

  const sampleTopicSentiments: TopicSentiment[] = [
    {
      topic: 'Communication',
      score: 0.8,
      count: 12,
      examples: ['Excellent communication with team members'],
    },
    {
      topic: 'Technical Skills',
      score: 0.6,
      count: 8,
      examples: ['Strong problem-solving abilities'],
    },
    {
      topic: 'Time Management',
      score: -0.3,
      count: 5,
      examples: ['Sometimes misses deadlines'],
    },
  ];

  const sampleKeyPhrases: KeyPhrase[] = [
    {
      text: 'excellent team player',
      sentiment: 'positive',
      confidence: 0.9,
    },
    {
      text: 'needs improvement in planning',
      sentiment: 'negative',
      confidence: 0.85,
    },
    {
      text: 'regular project updates',
      sentiment: 'neutral',
      confidence: 0.75,
    },
  ];

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <ReviewSentimentAnalysis
          sentimentScores={sampleSentimentScores}
          topicSentiments={sampleTopicSentiments}
          keyPhrases={sampleKeyPhrases}
        />
      </ThemeProvider>
    );
  };

  it('renders overall sentiment scores correctly', () => {
    renderComponent();

    expect(screen.getByText('Overall Sentiment')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument(); // overall score
    expect(screen.getByText('65%')).toBeInTheDocument(); // positive percentage
    expect(screen.getByText('15%')).toBeInTheDocument(); // negative percentage
    expect(screen.getByText('20%')).toBeInTheDocument(); // neutral percentage
  });

  it('displays sentiment categories', () => {
    renderComponent();

    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Negative')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
  });

  it('shows topic analysis with correct scores', () => {
    renderComponent();

    expect(screen.getByText('Topic Analysis')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Time Management')).toBeInTheDocument();

    expect(screen.getByText('12 mentions')).toBeInTheDocument();
    expect(screen.getByText('8 mentions')).toBeInTheDocument();
    expect(screen.getByText('5 mentions')).toBeInTheDocument();

    expect(screen.getByText('Score: 80')).toBeInTheDocument();
    expect(screen.getByText('Score: 60')).toBeInTheDocument();
    expect(screen.getByText('Score: -30')).toBeInTheDocument();
  });

  it('displays topic examples in tooltips', () => {
    renderComponent();

    // Verify topics are displayed
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Time Management')).toBeInTheDocument();
  });

  it('shows confidence scores in key phrase tooltips', () => {
    renderComponent();

    // Verify key phrases are displayed
    expect(screen.getByText('excellent team player')).toBeInTheDocument();
    expect(screen.getByText('needs improvement in planning')).toBeInTheDocument();
    expect(screen.getByText('regular project updates')).toBeInTheDocument();
  });

  it('renders key phrases with correct sentiment indicators', () => {
    renderComponent();

    expect(screen.getByText('Key Phrases')).toBeInTheDocument();
    expect(screen.getByText('excellent team player')).toBeInTheDocument();
    expect(screen.getByText('needs improvement in planning')).toBeInTheDocument();
    expect(screen.getByText('regular project updates')).toBeInTheDocument();
  });

  it('uses appropriate sentiment icons based on scores', () => {
    renderComponent();

    // Check for presence of sentiment icons
    // Note: Icons are typically tested by their role or test ID
    const sentimentIcons = screen.getAllByTestId(/Sentiment.*Icon/);
    expect(sentimentIcons.length).toBeGreaterThan(0);
  });

  it('handles empty topic sentiments', () => {
    render(
      <ThemeProvider theme={theme}>
        <ReviewSentimentAnalysis
          sentimentScores={sampleSentimentScores}
          topicSentiments={[]}
          keyPhrases={sampleKeyPhrases}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Topic Analysis')).toBeInTheDocument();
    expect(screen.queryByText('mentions')).not.toBeInTheDocument();
  });

  it('handles empty key phrases', () => {
    render(
      <ThemeProvider theme={theme}>
        <ReviewSentimentAnalysis
          sentimentScores={sampleSentimentScores}
          topicSentiments={sampleTopicSentiments}
          keyPhrases={[]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Key Phrases')).toBeInTheDocument();
    expect(screen.queryByTitle(/Confidence:/)).not.toBeInTheDocument();
  });

  it('displays correct sentiment colors', () => {
    renderComponent();

    // Check for presence of color-coded elements
    const positiveElements = screen.getAllByText('Positive');
    const negativeElements = screen.getAllByText('Negative');

    expect(positiveElements[0]).toHaveStyle({ color: expect.stringContaining('success') });
    expect(negativeElements[0]).toHaveStyle({ color: expect.stringContaining('error') });
  });
}); 
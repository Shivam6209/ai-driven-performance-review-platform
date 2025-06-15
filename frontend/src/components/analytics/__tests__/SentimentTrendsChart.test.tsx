import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SentimentTrendsChart from '../SentimentTrendsChart';
import { sentimentService, SentimentTrend } from '@/services/sentiment.service';

// Mock the recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-line-chart">{children}</div>
    ),
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-area-chart">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-bar-chart">{children}</div>
    ),
    Line: () => <div data-testid="recharts-line" />,
    Area: () => <div data-testid="recharts-area" />,
    Bar: () => <div data-testid="recharts-bar" />,
    XAxis: () => <div data-testid="recharts-xaxis" />,
    YAxis: () => <div data-testid="recharts-yaxis" />,
    CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
    Tooltip: () => <div data-testid="recharts-tooltip" />,
    Legend: () => <div data-testid="recharts-legend" />,
  };
});

// Mock the sentiment service
jest.mock('@/services/sentiment.service', () => ({
  sentimentService: {
    getEmployeeSentimentTrend: jest.fn(),
    getTeamSentimentTrend: jest.fn(),
  },
}));

describe('SentimentTrendsChart', () => {
  const mockEmployeeTrend: SentimentTrend = {
    employeeId: 'emp123',
    period: 'month',
    trends: [
      {
        date: '2023-01-01',
        sentiment: {
          positive: 0.7,
          neutral: 0.2,
          constructive: 0.05,
          concerning: 0.05,
        },
        quality: {
          high: 0.8,
          medium: 0.15,
          low: 0.05,
        },
        averageScore: 0.85,
      },
      {
        date: '2023-02-01',
        sentiment: {
          positive: 0.75,
          neutral: 0.15,
          constructive: 0.05,
          concerning: 0.05,
        },
        quality: {
          high: 0.85,
          medium: 0.1,
          low: 0.05,
        },
        averageScore: 0.9,
      },
    ],
  };

  const mockTeamTrends: SentimentTrend[] = [
    {
      employeeId: 'emp123',
      period: 'month',
      trends: [
        {
          date: '2023-01-01',
          sentiment: {
            positive: 0.7,
            neutral: 0.2,
            constructive: 0.05,
            concerning: 0.05,
          },
          quality: {
            high: 0.8,
            medium: 0.15,
            low: 0.05,
          },
          averageScore: 0.85,
        },
      ],
    },
    {
      employeeId: 'emp456',
      period: 'month',
      trends: [
        {
          date: '2023-01-01',
          sentiment: {
            positive: 0.6,
            neutral: 0.3,
            constructive: 0.05,
            concerning: 0.05,
          },
          quality: {
            high: 0.7,
            medium: 0.2,
            low: 0.1,
          },
          averageScore: 0.75,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (sentimentService.getEmployeeSentimentTrend as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockEmployeeTrend), 10000))
    );

    render(<SentimentTrendsChart employeeId="emp123" />);
    
    expect(screen.getByText('Sentiment Trends')).toBeInTheDocument();
    expect(screen.getByTestId('MuiSkeleton-root')).toBeInTheDocument();
  });

  it('displays error when API call fails', async () => {
    const errorMessage = 'Failed to fetch sentiment data';
    (sentimentService.getEmployeeSentimentTrend as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<SentimentTrendsChart employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('renders employee sentiment trends correctly', async () => {
    (sentimentService.getEmployeeSentimentTrend as jest.Mock).mockResolvedValue(mockEmployeeTrend);

    render(<SentimentTrendsChart employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText('Sentiment Trends')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    });
  });

  it('renders team sentiment trends correctly', async () => {
    (sentimentService.getTeamSentimentTrend as jest.Mock).mockResolvedValue(mockTeamTrends);

    render(<SentimentTrendsChart managerId="mgr123" />);

    await waitFor(() => {
      expect(screen.getByText('Team Sentiment Trends')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    });
  });

  it('changes chart type when toggle buttons are clicked', async () => {
    (sentimentService.getEmployeeSentimentTrend as jest.Mock).mockResolvedValue(mockEmployeeTrend);

    render(<SentimentTrendsChart employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    });

    // Click area chart button
    fireEvent.click(screen.getByRole('button', { name: /area chart/i }));

    await waitFor(() => {
      expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument();
    });

    // Click bar chart button
    fireEvent.click(screen.getByRole('button', { name: /bar chart/i }));

    await waitFor(() => {
      expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument();
    });
  });

  it('changes period when select is changed', async () => {
    (sentimentService.getEmployeeSentimentTrend as jest.Mock).mockResolvedValue(mockEmployeeTrend);

    render(<SentimentTrendsChart employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    });

    // Change period to weekly
    fireEvent.mouseDown(screen.getByLabelText('Period'));
    fireEvent.click(screen.getByRole('option', { name: /weekly/i }));

    expect(sentimentService.getEmployeeSentimentTrend).toHaveBeenCalledWith('emp123', 'week');
  });

  it('hides controls when showControls is false', async () => {
    (sentimentService.getEmployeeSentimentTrend as jest.Mock).mockResolvedValue(mockEmployeeTrend);

    render(<SentimentTrendsChart employeeId="emp123" showControls={false} />);

    await waitFor(() => {
      expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Period')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /line chart/i })).not.toBeInTheDocument();
  });

  it('throws error when neither employeeId nor managerId is provided', async () => {
    render(<SentimentTrendsChart />);

    await waitFor(() => {
      expect(screen.getByText('Either employeeId or managerId must be provided')).toBeInTheDocument();
    });
  });
}); 
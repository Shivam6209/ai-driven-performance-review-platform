import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { FeedbackAnalytics } from '../FeedbackAnalytics';
import { feedbackService } from '../../../services/feedback.service';

// Mock the feedback service
jest.mock('../../../services/feedback.service', () => ({
  feedbackService: {
    getFeedbackAnalytics: jest.fn(),
  },
}));

// Mock the recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Bar: () => <div data-testid="bar" />,
    Line: () => <div data-testid="line" />,
    Pie: () => <div data-testid="pie" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />,
  };
});

// Mock analytics data
const mockAnalyticsData = {
  frequency: {
    frequency_data: {
      '2023-01': 5,
      '2023-02': 8,
      '2023-03': 12,
    },
    group_by: 'month',
    total_count: 25,
  },
  quality: {
    average_score: 0.78,
    distribution: {
      excellent: 10,
      good: 8,
      average: 5,
      poor: 2,
      very_poor: 0,
    },
    sample_size: 25,
  },
  sentiment: {
    average_sentiment: 0.65,
    trend: [
      { date: '2023-01-15T00:00:00.000Z', score: 0.6 },
      { date: '2023-02-15T00:00:00.000Z', score: 0.65 },
      { date: '2023-03-15T00:00:00.000Z', score: 0.7 },
    ],
    sample_size: 25,
  },
  response_time: {
    average_response_time: 12.5,
    distribution: {
      under_1_hour: 5,
      under_24_hours: 10,
      under_48_hours: 5,
      under_week: 3,
      over_week: 2,
    },
    sample_size: 25,
  },
  action_completion: {
    action_rate: 0.8,
    acknowledged_count: 20,
    total_count: 25,
  },
  total_count: 25,
  date_range: {
    start_date: '2023-01-01T00:00:00.000Z',
    end_date: '2023-03-31T00:00:00.000Z',
  },
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

describe('FeedbackAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (feedbackService.getFeedbackAnalytics as jest.Mock).mockResolvedValue(mockAnalyticsData);
  });

  it('renders loading state initially', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(feedbackService.getFeedbackAnalytics).toHaveBeenCalled();
    });
  });

  it('displays frequency chart when frequency tab is selected', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Frequency tab should be selected by default
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText(/Feedback frequency by month/i)).toBeInTheDocument();
  });

  it('switches to quality chart when quality tab is clicked', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the quality tab
    fireEvent.click(screen.getByText('Quality'));
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText(/Average Quality Score: 0.78/i)).toBeInTheDocument();
  });

  it('switches to sentiment chart when sentiment tab is clicked', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the sentiment tab
    fireEvent.click(screen.getByText('Sentiment'));
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText(/Average Sentiment Score: 0.65/i)).toBeInTheDocument();
  });

  it('switches to response time chart when response time tab is clicked', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the response time tab
    fireEvent.click(screen.getByText('Response Time'));
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText(/Average Response Time: 12.5 hours/i)).toBeInTheDocument();
  });

  it('switches to action completion chart when action completion tab is clicked', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the action completion tab
    fireEvent.click(screen.getByText('Action Completion'));
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText(/Action Rate: 80.0%/i)).toBeInTheDocument();
  });

  it('shows all charts when all analytics tab is clicked', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the all analytics tab
    fireEvent.click(screen.getByText('All Analytics'));
    
    // Should show all charts
    const charts = screen.getAllByTestId(/chart/);
    expect(charts.length).toBeGreaterThan(3);
  });

  it('applies date filters when apply filters button is clicked', async () => {
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click apply filters
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Should call the service with date parameters
    expect(feedbackService.getFeedbackAnalytics).toHaveBeenCalledTimes(2);
  });

  it('handles error state', async () => {
    (feedbackService.getFeedbackAnalytics as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch analytics')
    );
    
    renderWithProviders(<FeedbackAnalytics />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(/Failed to load analytics data/i)).toBeInTheDocument();
  });
}); 
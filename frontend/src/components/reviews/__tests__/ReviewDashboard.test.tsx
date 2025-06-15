import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewDashboard, ReviewMetric, ReviewStatus, DepartmentMetrics, ReviewInsight } from '../ReviewDashboard';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

describe('ReviewDashboard', () => {
  const mockOnExportReport = jest.fn();

  const sampleMetrics: ReviewMetric[] = [
    {
      label: 'Average Score',
      value: 4.2,
      previousValue: 4.0,
      unit: '/5',
      description: 'Average performance rating across all reviews',
    },
    {
      label: 'Completion Rate',
      value: 85,
      previousValue: 75,
      unit: '%',
      description: 'Percentage of completed reviews',
    },
  ];

  const sampleStatus: ReviewStatus = {
    completed: 42,
    inProgress: 15,
    notStarted: 8,
    overdue: 3,
    total: 68,
  };

  const sampleDepartmentMetrics: DepartmentMetrics[] = [
    {
      name: 'Engineering',
      completionRate: 90,
      averageScore: 4.5,
      participantCount: 25,
    },
    {
      name: 'Product',
      completionRate: 75,
      averageScore: 4.2,
      participantCount: 15,
    },
    {
      name: 'Design',
      completionRate: 85,
      averageScore: 4.3,
      participantCount: 10,
    },
  ];

  const sampleInsights: ReviewInsight[] = [
    {
      type: 'positive',
      message: 'Engineering team shows improved performance',
      metric: 'Average Score',
      change: 0.5,
    },
    {
      type: 'negative',
      message: 'Increased number of overdue reviews',
      metric: 'Overdue Reviews',
      change: 2,
    },
    {
      type: 'neutral',
      message: 'Stable completion rates across departments',
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ReviewDashboard
          metrics={sampleMetrics}
          status={sampleStatus}
          departmentMetrics={sampleDepartmentMetrics}
          insights={sampleInsights}
          onExportReport={mockOnExportReport}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders metrics correctly', () => {
    renderComponent();

    expect(screen.getByText('Average Score')).toBeInTheDocument();
    const scoreElements = screen.getAllByText('4.2');
    expect(scoreElements.length).toBeGreaterThan(0);
    expect(screen.getByText('/5')).toBeInTheDocument();

    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('displays review status information', () => {
    renderComponent();

    expect(screen.getByText('Review Status')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument(); // (42/68) * 100

    expect(screen.getByText('42')).toBeInTheDocument(); // Completed
    expect(screen.getByText('15')).toBeInTheDocument(); // In Progress
    expect(screen.getByText('8')).toBeInTheDocument(); // Not Started
    expect(screen.getByText('3')).toBeInTheDocument(); // Overdue
  });

  it('shows department metrics', () => {
    renderComponent();

    expect(screen.getByText('Department Performance')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('25 participants')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('15 participants')).toBeInTheDocument();
    const scoreElements = screen.getAllByText('4.2');
    expect(scoreElements.length).toBeGreaterThan(0);

    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('10 participants')).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();
  });

  it('displays insights', () => {
    renderComponent();

    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Engineering team shows improved performance')).toBeInTheDocument();
    expect(screen.getByText('Increased number of overdue reviews')).toBeInTheDocument();
    expect(screen.getByText('Stable completion rates across departments')).toBeInTheDocument();
  });

  it('shows export report button when handler provided', () => {
    renderComponent();

    const exportButton = screen.getByText('Export Report');
    expect(exportButton).toBeInTheDocument();

    fireEvent.click(exportButton);
    expect(mockOnExportReport).toHaveBeenCalled();
  });

  it('hides export report button when handler not provided', () => {
    renderComponent({ onExportReport: undefined });
    expect(screen.queryByText('Export Report')).not.toBeInTheDocument();
  });

  it('shows metric tooltips with descriptions', () => {
    renderComponent();

    const infoButton = screen.getByLabelText('Average performance rating across all reviews');
    expect(infoButton).toBeInTheDocument();
  });

  it('handles empty department metrics', () => {
    renderComponent({ departmentMetrics: [] });
    expect(screen.getByText('Department Performance')).toBeInTheDocument();
  });

  it('handles empty insights', () => {
    renderComponent({ insights: [] });
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
  });

  it('shows trend indicators for metrics', () => {
    renderComponent();
    
    // Both metrics show improvement over previous values
    const trendIcons = screen.getAllByTestId(/TrendingUpIcon/);
    expect(trendIcons).toHaveLength(2);
  });

  it('calculates overall progress correctly', () => {
    const customStatus: ReviewStatus = {
      completed: 50,
      inProgress: 25,
      notStarted: 15,
      overdue: 10,
      total: 100,
    };

    renderComponent({ status: customStatus });
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
}); 
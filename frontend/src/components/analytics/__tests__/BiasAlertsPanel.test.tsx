import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BiasAlertsPanel from '../BiasAlertsPanel';
import { sentimentService, SentimentAlert } from '@/services/sentiment.service';

// Mock the sentiment service
jest.mock('@/services/sentiment.service', () => ({
  sentimentService: {
    getSentimentAlerts: jest.fn(),
    acknowledgeAlert: jest.fn(),
  },
}));

describe('BiasAlertsPanel', () => {
  const mockAlerts: SentimentAlert[] = [
    {
      id: 'alert1',
      employeeId: 'emp123',
      type: 'bias_detected',
      severity: 'high',
      message: 'Potential gender bias detected in recent feedback',
      timestamp: '2023-05-15T10:30:00Z',
      feedbackIds: ['feedback1', 'feedback2'],
      acknowledged: false,
    },
    {
      id: 'alert2',
      employeeId: 'emp123',
      type: 'sentiment_shift',
      severity: 'medium',
      message: 'Significant negative shift in feedback sentiment',
      timestamp: '2023-05-14T14:20:00Z',
      feedbackIds: ['feedback3'],
      acknowledged: false,
    },
    {
      id: 'alert3',
      employeeId: 'emp123',
      type: 'quality_drop',
      severity: 'low',
      message: 'Feedback quality has decreased',
      timestamp: '2023-05-13T09:15:00Z',
      feedbackIds: ['feedback4', 'feedback5'],
      acknowledged: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (sentimentService.getSentimentAlerts as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockAlerts), 10000))
    );

    render(<BiasAlertsPanel employeeId="emp123" />);
    
    expect(screen.getByText('Bias & Sentiment Alerts')).toBeInTheDocument();
    expect(screen.getAllByTestId('MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('displays error when API call fails', async () => {
    const errorMessage = 'Failed to fetch alerts';
    (sentimentService.getSentimentAlerts as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<BiasAlertsPanel employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays alerts correctly', async () => {
    (sentimentService.getSentimentAlerts as jest.Mock).mockResolvedValue(mockAlerts);

    render(<BiasAlertsPanel employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText('Potential gender bias detected in recent feedback')).toBeInTheDocument();
      expect(screen.getByText('Significant negative shift in feedback sentiment')).toBeInTheDocument();
      expect(screen.getByText('Feedback quality has decreased')).toBeInTheDocument();
    });

    // Check alert types are displayed
    expect(screen.getByText('Bias Detected')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Shift')).toBeInTheDocument();
    expect(screen.getByText('Quality Drop')).toBeInTheDocument();
  });

  it('shows empty state when no alerts', async () => {
    (sentimentService.getSentimentAlerts as jest.Mock).mockResolvedValue([]);

    render(<BiasAlertsPanel employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText('No alerts to display')).toBeInTheDocument();
      expect(screen.getByText("You've acknowledged all alerts")).toBeInTheDocument();
    });
  });

  it('acknowledges alert when acknowledge button is clicked', async () => {
    (sentimentService.getSentimentAlerts as jest.Mock).mockResolvedValue(mockAlerts);
    (sentimentService.acknowledgeAlert as jest.Mock).mockResolvedValue({});

    render(<BiasAlertsPanel employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText('Potential gender bias detected in recent feedback')).toBeInTheDocument();
    });

    // Click the acknowledge button for the first alert
    const acknowledgeButtons = screen.getAllByLabelText('acknowledge');
    fireEvent.click(acknowledgeButtons[0]);

    expect(sentimentService.acknowledgeAlert).toHaveBeenCalledWith('alert1');
  });

  it('opens dialog when alert is clicked', async () => {
    (sentimentService.getSentimentAlerts as jest.Mock).mockResolvedValue(mockAlerts);

    render(<BiasAlertsPanel employeeId="emp123" />);

    await waitFor(() => {
      expect(screen.getByText('Potential gender bias detected in recent feedback')).toBeInTheDocument();
    });

    // Click on the first alert
    fireEvent.click(screen.getByText('Potential gender bias detected in recent feedback'));

    // Dialog should be open with alert details
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Bias Detected')).toBeInTheDocument();
    
    // Close dialog
    fireEvent.click(screen.getByText('Close'));
    
    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('calls onAlertClick callback when alert is clicked', async () => {
    (sentimentService.getSentimentAlerts as jest.Mock).mockResolvedValue(mockAlerts);
    const onAlertClick = jest.fn();

    render(<BiasAlertsPanel employeeId="emp123" onAlertClick={onAlertClick} />);

    await waitFor(() => {
      expect(screen.getByText('Potential gender bias detected in recent feedback')).toBeInTheDocument();
    });

    // Click on the first alert
    fireEvent.click(screen.getByText('Potential gender bias detected in recent feedback'));

    expect(onAlertClick).toHaveBeenCalledWith(mockAlerts[0]);
  });

  it('shows more alerts when "Show More" button is clicked', async () => {
    // Create more mock alerts than the default display count
    const manyAlerts = Array.from({ length: 8 }, (_, i) => ({
      ...mockAlerts[0],
      id: `alert${i + 1}`,
      message: `Alert message ${i + 1}`,
    }));

    (sentimentService.getSentimentAlerts as jest.Mock).mockResolvedValue(manyAlerts);

    render(<BiasAlertsPanel employeeId="emp123" maxAlerts={5} />);

    await waitFor(() => {
      expect(screen.getByText('Alert message 1')).toBeInTheDocument();
    });

    // Initially only 5 alerts should be visible
    expect(screen.getByText('Alert message 5')).toBeInTheDocument();
    expect(screen.queryByText('Alert message 6')).not.toBeInTheDocument();

    // Click "Show More"
    fireEvent.click(screen.getByText(/Show More/));

    // Now more alerts should be visible
    await waitFor(() => {
      expect(screen.getByText('Alert message 6')).toBeInTheDocument();
      expect(screen.getByText('Alert message 8')).toBeInTheDocument();
    });
  });

  it('does not fetch alerts when employeeId is not provided', async () => {
    render(<BiasAlertsPanel />);
    
    expect(sentimentService.getSentimentAlerts).not.toHaveBeenCalled();
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SourceReference, SourceReferenceData } from '../SourceReference';
import { ThemeProvider, createTheme } from '@mui/material';
import userEvent from '@testing-library/user-event';

const theme = createTheme();

describe('SourceReference', () => {
  const mockOnSourceClick = jest.fn();

  const sampleSources: SourceReferenceData[] = [
    {
      id: '1',
      type: 'feedback',
      title: 'Team Feedback',
      preview: 'Excellent communication skills demonstrated in project meetings',
      date: '2024-02-20T10:00:00Z',
      confidence: 0.85,
      url: 'https://example.com/feedback/1',
    },
    {
      id: '2',
      type: 'goal',
      title: 'Q1 Goals',
      preview: 'Successfully completed all technical objectives',
      date: '2024-02-19T15:30:00Z',
      confidence: 0.75,
    },
  ];

  const mockSources: SourceReferenceData[] = [
    {
      id: '1',
      type: 'feedback',
      preview: 'Great communication skills',
      timestamp: '2024-01-15T10:00:00Z',
      confidence: 0.85,
    },
    {
      id: '2',
      type: 'goal',
      preview: 'Completed project ahead of schedule',
      timestamp: '2024-01-10T14:30:00Z',
      confidence: 0.92,
    },
    {
      id: '3',
      type: 'review',
      preview: 'Shows strong leadership qualities',
      timestamp: '2024-01-05T09:15:00Z',
      confidence: 0.78,
    },
  ];

  const mockOnToggle = jest.fn();

  const renderComponent = (props: {
    sources: SourceReferenceData[];
    onSourceClick?: (source: SourceReferenceData) => void;
  }) => {
    return render(
      <ThemeProvider theme={theme}>
        <SourceReference {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnToggle.mockClear();
  });

  it('renders all source references', () => {
    renderComponent({ sources: sampleSources });
    
    expect(screen.getByText('Team Feedback')).toBeInTheDocument();
    expect(screen.getByText('Q1 Goals')).toBeInTheDocument();
    expect(screen.getByText('Excellent communication skills demonstrated in project meetings')).toBeInTheDocument();
    expect(screen.getByText('Successfully completed all technical objectives')).toBeInTheDocument();
  });

  it('displays confidence scores correctly', () => {
    renderComponent({ sources: sampleSources });
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    renderComponent({ sources: sampleSources });
    
    // Note: This test might need adjustment based on the user's locale
    expect(screen.getByText('Feb 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('Feb 19, 2024')).toBeInTheDocument();
  });

  it('shows source URL link when available', () => {
    renderComponent({ sources: sampleSources });
    
    const link = screen.getByText('View Source');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/feedback/1');
  });

  it('calls onSourceClick when a source is clicked', () => {
    renderComponent({
      sources: sampleSources,
      onSourceClick: mockOnSourceClick,
    });
    
    const sourceCard = screen.getByText('Team Feedback').closest('.MuiCard-root');
    fireEvent.click(sourceCard!);
    
    expect(mockOnSourceClick).toHaveBeenCalledWith(sampleSources[0]);
  });

  it('does not call onSourceClick when not provided', () => {
    renderComponent({ sources: sampleSources });
    
    const sourceCard = screen.getByText('Team Feedback').closest('.MuiCard-root');
    fireEvent.click(sourceCard!);
    
    expect(mockOnSourceClick).not.toHaveBeenCalled();
  });

  it('displays appropriate icons for different source types', () => {
    renderComponent({ sources: sampleSources });
    
    // Note: Icons are typically tested by their aria-label or role
    const icons = screen.getAllByRole('button');
    expect(icons).toHaveLength(2); // One icon for each source
  });

  it('prevents link click propagation', () => {
    renderComponent({
      sources: sampleSources,
      onSourceClick: mockOnSourceClick,
    });
    
    const link = screen.getByText('View Source');
    fireEvent.click(link);
    
    expect(mockOnSourceClick).not.toHaveBeenCalled();
  });

  it('renders empty state when no sources provided', () => {
    renderComponent({ sources: [] });
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders source references header', () => {
    render(<SourceReference sources={mockSources} />);
    expect(screen.getByText('AI Source References')).toBeInTheDocument();
  });

  it('renders all sources when expanded', () => {
    render(<SourceReference sources={mockSources} expanded={true} />);
    mockSources.forEach(source => {
      expect(screen.getByText(source.preview)).toBeInTheDocument();
    });
  });

  it('hides sources when not expanded', () => {
    render(<SourceReference sources={mockSources} expanded={false} />);
    mockSources.forEach(source => {
      expect(screen.queryByText(source.preview)).not.toBeInTheDocument();
    });
  });

  it('shows expand/collapse button when onToggle is provided', () => {
    render(
      <SourceReference
        sources={mockSources}
        expanded={false}
        onToggle={mockOnToggle}
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onToggle when expand/collapse button is clicked', async () => {
    render(
      <SourceReference
        sources={mockSources}
        expanded={false}
        onToggle={mockOnToggle}
      />
    );
    
    const toggleButton = screen.getByRole('button');
    await userEvent.click(toggleButton);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('displays correct source type colors', () => {
    render(<SourceReference sources={mockSources} expanded={true} />);
    
    const feedbackChip = screen.getByText('feedback');
    const goalChip = screen.getByText('goal');
    const reviewChip = screen.getByText('review');

    expect(feedbackChip).toHaveClass('MuiChip-colorPrimary');
    expect(goalChip).toHaveClass('MuiChip-colorSuccess');
    expect(reviewChip).toHaveClass('MuiChip-colorWarning');
  });

  it('formats timestamps correctly', () => {
    render(<SourceReference sources={mockSources} expanded={true} />);
    
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 5, 2024')).toBeInTheDocument();
  });

  it('displays confidence scores as percentages', () => {
    render(<SourceReference sources={mockSources} expanded={true} />);
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('shows confidence score in tooltip', async () => {
    render(<SourceReference sources={mockSources} expanded={true} />);
    
    const confidenceChip = screen.getByText('85%');
    await userEvent.hover(confidenceChip);
    
    expect(screen.getByText('Confidence: 85.0%')).toBeInTheDocument();
  });
}); 
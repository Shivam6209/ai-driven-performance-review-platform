import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../index';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock the Layout component since we're testing the page content
jest.mock('@/components/layout/Layout', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// Mock the OKRProgress component
jest.mock('@/components/okr/OKRProgress', () => {
  return {
    __esModule: true,
    default: ({ title, description }: { title: string; description: string }) => (
      <div>
        <div>{title}</div>
        <div>{description}</div>
      </div>
    ),
  };
});

const theme = createTheme();

describe('Home Page', () => {
  const renderPage = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Home />
      </ThemeProvider>
    );
  };

  it('renders the dashboard title', () => {
    renderPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Track your performance and goals')).toBeInTheDocument();
  });

  it('renders the key objectives section', () => {
    renderPage();
    expect(screen.getByText('Key Objectives')).toBeInTheDocument();
  });

  it('renders all sample OKRs', () => {
    renderPage();
    expect(screen.getByText('Increase Customer Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('Achieve NPS score of 60+')).toBeInTheDocument();
    expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    expect(screen.getByText('Reach $10M ARR')).toBeInTheDocument();
    expect(screen.getByText('Employee Engagement')).toBeInTheDocument();
    expect(screen.getByText('Maintain 85% engagement score')).toBeInTheDocument();
  });

  it('renders the upcoming reviews section', () => {
    renderPage();
    expect(screen.getByText('Upcoming Reviews')).toBeInTheDocument();
    expect(screen.getByText('No upcoming reviews scheduled')).toBeInTheDocument();
  });

  it('renders the recent feedback section', () => {
    renderPage();
    expect(screen.getByText('Recent Feedback')).toBeInTheDocument();
    expect(screen.getByText('No recent feedback received')).toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import OKRDashboard from '../OKRDashboard';

// Mock the window.matchMedia function for useMediaQuery
window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Create a theme for the ThemeProvider
const theme = createTheme();

describe('OKRDashboard', () => {
  const renderDashboard = () => {
    render(
      <ThemeProvider theme={theme}>
        <OKRDashboard />
      </ThemeProvider>
    );
  };

  it('renders the dashboard title', () => {
    renderDashboard();
    expect(screen.getByText('OKR Dashboard')).toBeInTheDocument();
  });

  it('renders the summary cards', () => {
    renderDashboard();
    expect(screen.getByText('Total OKRs')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Average Progress')).toBeInTheDocument();
    expect(screen.getByText('Active OKRs')).toBeInTheDocument();
  });

  it('renders the tab navigation', () => {
    renderDashboard();
    expect(screen.getByText('All OKRs')).toBeInTheDocument();
    expect(screen.getByText('My OKRs')).toBeInTheDocument();
    expect(screen.getByText('Team OKRs')).toBeInTheDocument();
    expect(screen.getByText('Department OKRs')).toBeInTheDocument();
  });

  it('allows switching between tabs', () => {
    renderDashboard();
    const teamTab = screen.getByText('Team OKRs');
    fireEvent.click(teamTab);
    // Add assertions for tab content changes
  });

  it('opens the goal editor when clicking Add OKR', () => {
    renderDashboard();
    const addButtons = screen.getAllByText('Add OKR');
    fireEvent.click(addButtons[0]); // Click the first Add OKR button
    expect(screen.getByText('Create New OKR')).toBeInTheDocument();
  });

  it('displays mock OKRs in the list', () => {
    renderDashboard();
    expect(screen.getByText('Improve Development Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Optimize Development Process')).toBeInTheDocument();
  });

  it('shows OKR details when selecting an OKR', () => {
    renderDashboard();
    const okrTitle = screen.getByText('Improve Development Efficiency');
    fireEvent.click(okrTitle);
    expect(screen.getByText('OKR Details')).toBeInTheDocument();
    expect(screen.getByText('Progress Updates')).toBeInTheDocument();
  });
});

// Test OKRProgress component
describe('OKRProgress', () => {
  it('displays progress correctly', () => {
    // Add tests for OKRProgress component
  });
});

// Test GoalEditor component
describe('GoalEditor', () => {
  it('validates required fields', () => {
    // Add tests for GoalEditor component
  });
});

// Test OKRList component
describe('OKRList', () => {
  it('renders OKR items correctly', () => {
    // Add tests for OKRList component
  });
});

// Test OKRDetail component
describe('OKRDetail', () => {
  it('displays OKR information correctly', () => {
    // Add tests for OKRDetail component
  });
});

// Test OKRUpdateForm component
describe('OKRUpdateForm', () => {
  it('handles form submission correctly', () => {
    // Add tests for OKRUpdateForm component
  });
}); 
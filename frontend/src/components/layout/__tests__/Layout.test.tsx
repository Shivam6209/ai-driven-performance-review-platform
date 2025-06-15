import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from '../Layout';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

describe('Layout', () => {
  const renderComponent = (children = <div>Test Content</div>) => {
    return render(
      <ThemeProvider theme={theme}>
        <Layout>{children}</Layout>
      </ThemeProvider>
    );
  };

  it('renders the app title', () => {
    renderComponent();
    expect(screen.getByText('Performance Review Platform')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderComponent();
    const navigationItems = ['Dashboard', 'Reviews', 'OKRs', 'Feedback', 'Profile'];
    
    navigationItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders children content', () => {
    renderComponent(<div>Custom Child Content</div>);
    expect(screen.getByText('Custom Child Content')).toBeInTheDocument();
  });

  it('toggles mobile drawer when menu button is clicked', () => {
    renderComponent();
    const menuButton = screen.getByLabelText('open drawer');
    
    // Initial state - drawer should be closed
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    
    // Open drawer
    fireEvent.click(menuButton);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    
    // Close drawer
    fireEvent.click(menuButton);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });
}); 
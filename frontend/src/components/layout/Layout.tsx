import React, { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps the application content
 * Includes the header and sidebar navigation
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          backgroundColor: '#f8fafc',
        }}>
          Loading...
        </Box>
      </>
    );
  }

  // If user is not authenticated, only render children without layout
  if (!currentUser) {
    return (
      <>
        <CssBaseline />
        {children}
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        backgroundColor: '#f8fafc', // Light gray background
        overflow: 'hidden',
      }}>
        {/* Sidebar navigation */}
        <Sidebar />
        
        {/* Main content area */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          overflow: 'hidden',
          minWidth: 0,
          backgroundColor: '#f8fafc',
        }}>
          {/* Header with user profile */}
          <Header />
          
          {/* Main content */}
          <Box 
            component="main" 
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: { xs: 3, sm: 4 },
              backgroundColor: '#f8fafc',
              minHeight: 0,
              width: '100%',
              // Custom scrollbar
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#94a3b8',
                },
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Layout; 
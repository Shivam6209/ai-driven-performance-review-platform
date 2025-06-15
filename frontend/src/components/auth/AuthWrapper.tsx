import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthWrapper Component
 * 
 * Handles authentication state and redirects properly without causing loops
 */
export default function AuthWrapper({
  children,
  requireAuth = true,
  redirectTo = '/auth/login'
}: AuthWrapperProps): JSX.Element {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) return;

    // If authentication is required but user is not logged in
    if (requireAuth && !currentUser && !isRedirecting) {
      console.log('🔐 AuthWrapper: User not authenticated, redirecting to login');
      setIsRedirecting(true);
      router.replace(redirectTo);
      return;
    }

    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (!requireAuth && currentUser && !isRedirecting) {
      const authPages = ['/auth/login', '/auth/register'];
      if (authPages.includes(router.pathname)) {
        console.log('🔐 AuthWrapper: User already authenticated, redirecting to dashboard');
        setIsRedirecting(true);
        router.replace('/dashboard');
        return;
      }
    }

    // Reset redirecting state if we're not redirecting
    if (isRedirecting) {
      setIsRedirecting(false);
    }
  }, [currentUser, loading, requireAuth, router, redirectTo, isRedirecting]);

  // Show loading spinner while checking authentication or redirecting
  if (loading || isRedirecting) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Checking authentication...' : 'Redirecting...'}
        </Typography>
      </Box>
    );
  }

  // If auth is required and user is not logged in, don't render children
  // (this should not happen due to redirect above, but just in case)
  if (requireAuth && !currentUser) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography variant="h6" color="error">
          Authentication Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please log in to access this page.
        </Typography>
      </Box>
    );
  }

  // Render children if everything is okay
  return <>{children}</>;
} 
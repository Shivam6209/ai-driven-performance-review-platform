import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps components that require authentication and/or specific roles
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  fallback
}: ProtectedRouteProps): JSX.Element {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      // If auth is loading, wait
      if (loading) {
        return;
      }

      // If not authenticated, redirect to login
      if (!currentUser) {
        await router.push('/auth/login');
        return;
      }

      // If no specific roles required, user is authorized
      if (requiredRoles.length === 0) {
        setIsAuthorized(true);
        return;
      }

      // Check if user has required role
      const hasRequiredRole = requiredRoles.includes(currentUser.role as UserRole);

      if (!hasRequiredRole) {
        // Redirect to unauthorized page
        await router.push('/unauthorized');
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [currentUser, loading, router, requiredRoles]);

  // Show loading spinner while checking authentication
  if (loading) {
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
          Loading...
        </Typography>
      </Box>
    );
  }

  // Show fallback component if provided and not authorized
  if (!isAuthorized && fallback) {
    return <>{fallback}</>;
  }

  // Show children if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Default fallback - should not reach here due to redirects
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
        Access Denied
      </Typography>
      <Typography variant="body2" color="text.secondary">
        You don't have permission to access this page.
      </Typography>
    </Box>
  );
} 
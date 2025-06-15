import React from 'react';
import LandingPage from '@/components/landing/LandingPage';

/**
 * Home Page Component
 * 
 * Landing page that shows different content based on authentication status:
 * - For unauthenticated users: Shows landing page with login/register options
 * - For authenticated users: Shows welcome message with dashboard access
 */
export default function Home(): JSX.Element {
  return <LandingPage />;
} 
import React, { useEffect } from 'react';
import { useFirebaseNotifications } from '../../hooks/useFirebaseNotifications';

/**
 * Firebase Initialization Component
 * Handles Firebase setup and notification initialization
 */
const FirebaseInit: React.FC = () => {
  const { initializeNotifications } = useFirebaseNotifications();

  useEffect(() => {
    // Initialize Firebase notifications when component mounts
    initializeNotifications();
  }, [initializeNotifications]);

  // This component doesn't render anything
  return null;
};

export default FirebaseInit; 
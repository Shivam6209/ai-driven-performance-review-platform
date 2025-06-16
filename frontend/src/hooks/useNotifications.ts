import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'invitation_accepted' | 'invitation_sent' | 'user_joined' | 'department_assigned' | 'department_removed';
  title: string;
  message: string;
  data?: any;
  userId: string;
  timestamp: Date;
  read?: boolean;
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: any = null;
let database: any = null;

try {
  // Only initialize if we have the required config
  if (firebaseConfig.projectId && firebaseConfig.databaseURL) {
    firebaseApp = initializeApp(firebaseConfig);
    database = getDatabase(firebaseApp);
    console.log('✅ Firebase initialized for real-time notifications');
  } else {
    console.warn('⚠️ Firebase configuration incomplete. Real-time notifications disabled.');
    console.log('Required environment variables:');
    console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    console.log('- NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  }
} catch (error) {
  console.warn('❌ Firebase initialization failed:', error);
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!database || !user?.id) {
      setLoading(false);
      return;
    }

    const notificationsRef = ref(database, `notifications/${user.id}`);
    
    const unsubscribe = onValue(
      notificationsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const notificationsList: Notification[] = Object.entries(data).map(([id, notification]: [string, any]) => ({
              id,
              ...notification,
              timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date(),
            }));
            
            // Sort by timestamp (newest first)
            notificationsList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            setNotifications(notificationsList);
          } else {
            setNotifications([]);
          }
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing notifications:', err);
          setError('Failed to load notifications');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firebase notifications error:', error);
        setError('Failed to connect to notifications');
        setLoading(false);
      }
    );

    return () => {
      if (notificationsRef) {
        off(notificationsRef, 'value', unsubscribe);
      }
    };
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    clearAll,
  };
}; 
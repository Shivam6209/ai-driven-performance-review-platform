import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback' | 'review' | 'okr';
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

export const useFirebaseNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock notifications for development
  useEffect(() => {
    if (!currentUser?.id) return;

    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: currentUser.id,
        title: 'New Feedback Received',
        message: 'Sarah Johnson provided feedback on your Q4 project delivery',
        type: 'feedback',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        data: { feedbackId: 'feedback-1' }
      },
      {
        id: '2',
        userId: currentUser.id,
        title: 'OKR Update Required',
        message: 'Please update your Q4 OKR progress',
        type: 'okr',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        data: { okrId: 'okr-1' }
      },
      {
        id: '3',
        userId: currentUser.id,
        title: 'Performance Review Scheduled',
        message: 'Your Q4 performance review has been scheduled for next week',
        type: 'review',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        data: { reviewId: 'review-1' }
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
    setLoading(false);
  }, [currentUser?.id]);

  // Initialize notifications (no-op in development)
  const initializeNotifications = useCallback(async () => {
    console.log('Development mode: Notifications initialized (mock)');
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Send notification (mock)
  const sendNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    data?: Record<string, any>
  ) => {
    console.log('Development mode: Mock notification sent', { userId, title, message, type, data });
    
    // Add to notifications list if it's for current user
    if (userId === currentUser?.id) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
        data
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [currentUser?.id]);

  // Send notification to multiple users (mock)
  const sendNotificationToUsers = useCallback(async (
    userIds: string[],
    title: string,
    message: string,
    type: Notification['type'],
    data?: Record<string, any>
  ) => {
    console.log('Development mode: Mock notifications sent to users', { userIds, title, message, type, data });
    
    // Add to notifications list if current user is in the list
    if (userIds.includes(currentUser?.id || '')) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        userId: currentUser?.id || '',
        title,
        message,
        type,
        read: false,
        createdAt: new Date(),
        data
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [currentUser?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    sendNotification,
    sendNotificationToUsers,
    initializeNotifications
  };
}; 
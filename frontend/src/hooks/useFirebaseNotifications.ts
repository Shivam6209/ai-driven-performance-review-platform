import { useState, useEffect, useCallback, useRef } from 'react';
import { firebaseNotificationService, type Notification } from '../services/firebase-notifications.service';
import { useAuth } from '../contexts/AuthContext';

export const useFirebaseNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Initialize FCM and request permission - memoized to prevent re-creation
  const initializeNotifications = useCallback(async () => {
    if (initializedRef.current) return;
    
    try {
      initializedRef.current = true;
      const token = await firebaseNotificationService.requestPermission();
      if (token) {
        console.log('FCM Token:', token);
        // You can send this token to your backend to store for the user
      }

      // Listen for foreground messages
      await firebaseNotificationService.onForegroundMessage((payload) => {
        console.log('Received foreground message:', payload);
        // You can show a toast notification here
        if (payload.notification) {
          // Show browser notification or custom toast
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/icons/icon-192x192.png'
          });
        }
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setError('Failed to initialize notifications');
      initializedRef.current = false; // Reset on error
    }
  }, []); // Empty dependency array since this should only run once

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!currentUser?.id) return;

    setLoading(true);
    const unsubscribe = firebaseNotificationService.subscribeToNotifications(
      currentUser.id,
      (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id]);

  // Initialize FCM on mount - only once
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  // Mark notification as read - memoized
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await firebaseNotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read - memoized with stable dependency
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      await firebaseNotificationService.markAllAsRead(currentUser.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  }, [currentUser?.id]);

  // Send notification - memoized
  const sendNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    data?: Record<string, any>
  ) => {
    try {
      await firebaseNotificationService.sendNotificationToUser(userId, title, message, type, data);
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification');
    }
  }, []);

  // Send notification to multiple users - memoized
  const sendNotificationToUsers = useCallback(async (
    userIds: string[],
    title: string,
    message: string,
    type: Notification['type'],
    data?: Record<string, any>
  ) => {
    try {
      await firebaseNotificationService.sendNotificationToUsers(userIds, title, message, type, data);
    } catch (error) {
      console.error('Error sending notifications:', error);
      setError('Failed to send notifications');
    }
  }, []);

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
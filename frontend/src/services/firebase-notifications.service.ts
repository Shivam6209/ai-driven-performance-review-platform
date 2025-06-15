import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { db, getMessagingInstance } from '../lib/firebase';
import { config } from '../config/index';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'review' | 'feedback' | 'okr' | 'system';
  read: boolean;
  createdAt: Timestamp;
  data?: Record<string, any>;
}

class FirebaseNotificationService {
  private unsubscribe: (() => void) | null = null;

  // Request permission and get FCM token
  async requestPermission(): Promise<string | null> {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return null;

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: config.firebase.vapidKey
        });
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Listen for foreground messages
  async onForegroundMessage(callback: (payload: any) => void) {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('Error setting up foreground message listener:', error);
    }
  }

  // Create a new notification in Firestore
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Listen to real-time notifications for a user
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        } as Notification);
      });
      callback(notifications);
    });

    return this.unsubscribe;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Send notification to specific user (for admin use)
  async sendNotificationToUser(
    userId: string, 
    title: string, 
    message: string, 
    type: Notification['type'],
    data?: Record<string, any>
  ): Promise<void> {
    await this.createNotification({
      userId,
      title,
      message,
      type,
      read: false,
      data
    });
  }

  // Send notification to multiple users
  async sendNotificationToUsers(
    userIds: string[], 
    title: string, 
    message: string, 
    type: Notification['type'],
    data?: Record<string, any>
  ): Promise<void> {
    const promises = userIds.map(userId => 
      this.createNotification({
        userId,
        title,
        message,
        type,
        read: false,
        data
      })
    );
    await Promise.all(promises);
  }
}

export const firebaseNotificationService = new FirebaseNotificationService(); 
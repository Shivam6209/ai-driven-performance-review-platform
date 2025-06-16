import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface NotificationData {
  type: 'invitation_accepted' | 'invitation_sent' | 'user_joined' | 'department_assigned' | 'department_removed' | 'okr_update';
  title: string;
  message: string;
  data?: any;
  userId: string;
  timestamp: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn('Firebase credentials not configured. Real-time notifications will be disabled.');
        return;
      }

      // Parse the private key (handle escaped newlines)
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

      const serviceAccount = {
        projectId,
        privateKey: formattedPrivateKey,
        clientEmail,
      };

      // Initialize Firebase Admin SDK
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`
      });

      this.logger.log('✅ Firebase initialized successfully for real-time notifications');
    } catch (error: any) {
      this.logger.error('❌ Failed to initialize Firebase:', error.message);
      this.firebaseApp = null;
    }
  }

  /**
   * Send real-time notification to a specific user
   */
  async sendNotificationToUser(userId: string, notification: Omit<NotificationData, 'userId' | 'timestamp'>) {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Notification not sent.');
      return;
    }

    try {
      const database = admin.database(this.firebaseApp);
      const notificationData: NotificationData = {
        ...notification,
        userId,
        timestamp: new Date(),
      };

      // Store notification in Firebase Realtime Database
      const notificationRef = database.ref(`notifications/${userId}`).push();
      await notificationRef.set(notificationData);

      this.logger.log(`✅ Notification sent to user ${userId}: ${notification.title}`);
      
      return {
        success: true,
        notificationId: notificationRef.key,
        data: notificationData
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send notification to user ${userId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send invitation accepted notification to the invitor
   */
  async sendInvitationAcceptedNotification(invitorId: string, inviteeEmail: string, inviteeName: string) {
    return this.sendNotificationToUser(invitorId, {
      type: 'invitation_accepted',
      title: '🎉 Invitation Accepted!',
      message: `${inviteeName} (${inviteeEmail}) has joined the platform and accepted your invitation.`,
      data: {
        inviteeEmail,
        inviteeName,
        action: 'invitation_accepted'
      }
    });
  }

  /**
   * Send invitation sent notification
   */
  async sendInvitationSentNotification(invitorId: string, inviteeEmail: string) {
    return this.sendNotificationToUser(invitorId, {
      type: 'invitation_sent',
      title: '📧 Invitation Sent',
      message: `Invitation has been sent to ${inviteeEmail}. They will receive login credentials via email.`,
      data: {
        inviteeEmail,
        action: 'invitation_sent'
      }
    });
  }

  /**
   * Send user joined notification to admins/HR
   */
  async sendUserJoinedNotification(adminIds: string[], newUserEmail: string, newUserName: string) {
    const promises = adminIds.map(adminId => 
      this.sendNotificationToUser(adminId, {
        type: 'user_joined',
        title: '👋 New User Joined',
        message: `${newUserName} (${newUserEmail}) has joined the organization.`,
        data: {
          newUserEmail,
          newUserName,
          action: 'user_joined'
        }
      })
    );

    return Promise.all(promises);
  }

  /**
   * Send department assignment notification to employee
   */
  async sendDepartmentAssignedNotification(userId: string, departmentName: string, assignedByName: string) {
    return this.sendNotificationToUser(userId, {
      type: 'department_assigned',
      title: '🏢 Assigned to Department',
      message: `You have been assigned to the ${departmentName} department by ${assignedByName}.`,
      data: {
        departmentName,
        assignedByName,
        action: 'department_assigned'
      }
    });
  }

  /**
   * Send department removal notification to employee
   */
  async sendDepartmentRemovedNotification(userId: string, departmentName: string, removedByName: string) {
    return this.sendNotificationToUser(userId, {
      type: 'department_removed',
      title: '🏢 Removed from Department',
      message: `You have been removed from the ${departmentName} department by ${removedByName}.`,
      data: {
        departmentName,
        removedByName,
        action: 'department_removed'
      }
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    if (!this.firebaseApp) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const database = admin.database(this.firebaseApp);
      const snapshot = await database.ref(`notifications/${userId}`)
        .orderByChild('timestamp')
        .limitToLast(limit)
        .once('value');

      const notifications: any[] = [];
      snapshot.forEach((child) => {
        notifications.unshift({
          id: child.key,
          ...child.val()
        });
      });

      return {
        success: true,
        notifications
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to get notifications for user ${userId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(userId: string, notificationId: string) {
    if (!this.firebaseApp) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const database = admin.database(this.firebaseApp);
      await database.ref(`notifications/${userId}/${notificationId}/read`).set(true);
      
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Failed to mark notification as read:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearUserNotifications(userId: string) {
    if (!this.firebaseApp) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const database = admin.database(this.firebaseApp);
      await database.ref(`notifications/${userId}`).remove();
      
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Failed to clear notifications for user ${userId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 
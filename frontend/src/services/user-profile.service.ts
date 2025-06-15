import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '@/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr_admin' | 'executive';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string;
  departmentId?: string;
  managerId?: string;
}

class UserProfileService {
  private readonly COLLECTION_NAME = 'userProfiles';

  /**
   * Create a new user profile in Firestore
   */
  async createUserProfile(userId: string, profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const now = new Date().toISOString();
    const userProfile: UserProfile = {
      ...profileData,
      id: userId,
      createdAt: now,
      updatedAt: now,
    };

    const userDocRef = doc(db, this.COLLECTION_NAME, userId);
    await setDoc(userDocRef, userProfile);

    return userProfile;
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile in Firestore
   */
  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<void> {
    const userDocRef = doc(db, this.COLLECTION_NAME, userId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userDocRef, updateData);
  }

  /**
   * Convert UserProfile to User type
   */
  profileToUser(profile: UserProfile): User {
    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
      isActive: profile.isActive,
      profileImageUrl: profile.profileImageUrl,
      departmentId: profile.departmentId,
      managerId: profile.managerId,
    };
  }

  /**
   * Create user profile from registration data
   */
  async createProfileFromRegistration(
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    role: 'employee' | 'manager' | 'hr_admin' | 'executive'
  ): Promise<UserProfile> {
    return this.createUserProfile(userId, {
      email,
      firstName,
      lastName,
      role,
      isActive: true,
    });
  }
}

export const userProfileService = new UserProfileService(); 
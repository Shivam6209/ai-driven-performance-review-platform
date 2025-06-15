import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FirebaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OKR extends FirebaseDocument {
  userId: string;
  title: string;
  description: string;
  progress: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  dueDate: Timestamp;
  keyResults: KeyResult[];
}

export interface KeyResult {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
}

export interface Feedback extends FirebaseDocument {
  fromUserId: string;
  toUserId: string;
  content: string;
  type: 'positive' | 'constructive' | 'suggestion';
  tags: string[];
  isAnonymous: boolean;
}

export interface Review extends FirebaseDocument {
  employeeId: string;
  managerId: string;
  period: string;
  status: 'draft' | 'in_progress' | 'completed';
  selfAssessment?: string;
  managerReview?: string;
  goals: string[];
  rating?: number;
}

class FirebaseDataService {
  // Generic CRUD operations
  async create<T extends FirebaseDocument>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async update<T extends FirebaseDocument>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  async getById<T extends FirebaseDocument>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  async getAll<T extends FirebaseDocument>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });
      return documents;
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToCollection<T extends FirebaseDocument>(
    collectionName: string,
    callback: (documents: T[]) => void,
    constraints?: any[]
  ): () => void {
    let q = collection(db, collectionName);
    
    if (constraints && constraints.length > 0) {
      q = query(q, ...constraints) as any;
    }

    return onSnapshot(q, (snapshot) => {
      const documents: T[] = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });
      callback(documents);
    });
  }

  subscribeToDocument<T extends FirebaseDocument>(
    collectionName: string,
    id: string,
    callback: (document: T | null) => void
  ): () => void {
    return onSnapshot(doc(db, collectionName, id), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as T);
      } else {
        callback(null);
      }
    });
  }

  // OKR specific methods
  async createOKR(okr: Omit<OKR, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<OKR>('okrs', okr);
  }

  async updateOKRProgress(okrId: string, progress: number): Promise<void> {
    return this.update<OKR>('okrs', okrId, { progress });
  }

  subscribeToUserOKRs(userId: string, callback: (okrs: OKR[]) => void): () => void {
    return this.subscribeToCollection<OKR>(
      'okrs',
      callback,
      [where('userId', '==', userId), orderBy('createdAt', 'desc')]
    );
  }

  // Feedback specific methods
  async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Feedback>('feedback', feedback);
  }

  subscribeToUserFeedback(userId: string, callback: (feedback: Feedback[]) => void): () => void {
    return this.subscribeToCollection<Feedback>(
      'feedback',
      callback,
      [where('toUserId', '==', userId), orderBy('createdAt', 'desc')]
    );
  }

  subscribeToFeedbackGiven(userId: string, callback: (feedback: Feedback[]) => void): () => void {
    return this.subscribeToCollection<Feedback>(
      'feedback',
      callback,
      [where('fromUserId', '==', userId), orderBy('createdAt', 'desc')]
    );
  }

  // Review specific methods
  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Review>('reviews', review);
  }

  subscribeToEmployeeReviews(employeeId: string, callback: (reviews: Review[]) => void): () => void {
    return this.subscribeToCollection<Review>(
      'reviews',
      callback,
      [where('employeeId', '==', employeeId), orderBy('createdAt', 'desc')]
    );
  }

  subscribeToManagerReviews(managerId: string, callback: (reviews: Review[]) => void): () => void {
    return this.subscribeToCollection<Review>(
      'reviews',
      callback,
      [where('managerId', '==', managerId), orderBy('createdAt', 'desc')]
    );
  }

  // Analytics and aggregation methods
  async getTeamOKRs(teamMemberIds: string[]): Promise<OKR[]> {
    if (teamMemberIds.length === 0) return [];
    
    try {
      const q = query(
        collection(db, 'okrs'),
        where('userId', 'in', teamMemberIds),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const okrs: OKR[] = [];
      querySnapshot.forEach((doc) => {
        okrs.push({ id: doc.id, ...doc.data() } as OKR);
      });
      return okrs;
    } catch (error) {
      console.error('Error getting team OKRs:', error);
      throw error;
    }
  }

  async getRecentFeedback(userId: string, limitCount: number = 10): Promise<Feedback[]> {
    try {
      const q = query(
        collection(db, 'feedback'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const feedback: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        feedback.push({ id: doc.id, ...doc.data() } as Feedback);
      });
      return feedback;
    } catch (error) {
      console.error('Error getting recent feedback:', error);
      throw error;
    }
  }
}

export const firebaseDataService = new FirebaseDataService(); 
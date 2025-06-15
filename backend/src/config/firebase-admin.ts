import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export function initializeFirebaseAdmin(configService?: ConfigService) {
  console.log('🔥 Initializing Firebase Admin SDK...');

  // Get Firebase configuration from environment variables directly
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || configService?.get('FIREBASE_PROJECT_ID'),
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || configService?.get('FIREBASE_PRIVATE_KEY'))?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || configService?.get('FIREBASE_CLIENT_EMAIL'),
    databaseURL: process.env.FIREBASE_DATABASE_URL || configService?.get('FIREBASE_DATABASE_URL'),
  };

  console.log('🔍 Firebase Config Check:');
  console.log('- Project ID:', firebaseConfig.projectId ? '✅ Set' : '❌ Missing');
  console.log('- Client Email:', firebaseConfig.clientEmail ? '✅ Set' : '❌ Missing');
  console.log('- Private Key:', firebaseConfig.privateKey ? '✅ Set' : '❌ Missing');
  console.log('- Database URL:', firebaseConfig.databaseURL ? '✅ Set' : '❌ Missing');

  // Check if Firebase is already initialized
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin already initialized');
    return admin;
  }

  // Validate required configuration
  if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
    console.error('❌ Firebase configuration incomplete. Required: projectId, privateKey, clientEmail');
    console.error('🔧 Please check your .env file has:');
    console.error('   - FIREBASE_PROJECT_ID');
    console.error('   - FIREBASE_PRIVATE_KEY');
    console.error('   - FIREBASE_CLIENT_EMAIL');
    
    // Return a mock admin for development to prevent crashes
    return createMockFirebaseAdmin();
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        privateKey: firebaseConfig.privateKey,
        clientEmail: firebaseConfig.clientEmail,
      }),
      databaseURL: firebaseConfig.databaseURL,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('🎯 Project ID:', firebaseConfig.projectId);
    
    return admin;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    console.error('🔧 This will cause authentication to fail!');
    
    // Return a mock admin for development to prevent crashes
    return createMockFirebaseAdmin();
  }
}

// Create a mock Firebase Admin for development when Firebase is not configured
function createMockFirebaseAdmin() {
  console.warn('⚠️  Using MOCK Firebase Admin - Authentication will not work!');
  
  return {
    auth: () => ({
      verifyIdToken: async (token: string) => {
        console.warn('🚫 MOCK: Firebase token verification called with token:', token.substring(0, 20) + '...');
        throw new Error('Firebase Admin not properly configured - check your .env file');
      }
    })
  };
} 
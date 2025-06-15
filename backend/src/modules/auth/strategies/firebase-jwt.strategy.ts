import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseJwtStrategy extends PassportStrategy(Strategy, 'firebase-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_request: any, _rawJwtToken: any, done: any) => {
        // We don't need a secret for Firebase tokens as they are verified by Firebase Admin SDK
        done(null, null);
      },
      passReqToCallback: true,
    });
  }

  async validate(request: any, _payload: any): Promise<any> {
    console.log('🔐 Firebase JWT Strategy: Starting token validation...');
    
    try {
      // Extract the token from the Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('❌ No valid authorization header found');
        console.error('📋 Headers received:', Object.keys(request.headers));
        throw new UnauthorizedException('No valid authorization header found');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('🎫 Token extracted, length:', token.length);
      console.log('🎫 Token preview:', token.substring(0, 50) + '...');

      // Check if Firebase Admin is initialized
      if (!admin.apps.length) {
        console.error('❌ Firebase Admin SDK not initialized!');
        throw new UnauthorizedException('Firebase Admin SDK not initialized - server configuration error');
      }

      console.log('🔍 Verifying Firebase ID token...');
      
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      console.log('✅ Firebase token verified successfully');
      console.log('👤 User ID:', decodedToken.uid);
      console.log('📧 Email:', decodedToken.email);
      
      const user = {
        userId: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        firebaseUid: decodedToken.uid,
        // Add additional fields that might be needed
        name: decodedToken.name,
        picture: decodedToken.picture,
      };

      console.log('🎯 User object created:', { userId: user.userId, email: user.email });
      return user;
      
    } catch (error: any) {
      console.error('❌ Firebase token validation error:');
      console.error('🔍 Error type:', error.constructor?.name);
      console.error('📝 Error message:', error.message);
      
      if (error.code) {
        console.error('🏷️  Error code:', error.code);
      }
      
      // Provide specific error messages based on error type
      if (error.message?.includes('Firebase Admin not properly configured')) {
        throw new UnauthorizedException('Server configuration error: Firebase Admin SDK not properly configured');
      }
      
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Firebase token has expired - please refresh your session');
      }
      
      if (error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Firebase token format');
      }
      
      if (error.code === 'auth/project-not-found') {
        throw new UnauthorizedException('Firebase project configuration error');
      }
      
      // Generic error for other cases
      throw new UnauthorizedException(`Firebase authentication failed: ${error.message || 'Unknown error'}`);
    }
  }
} 
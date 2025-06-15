import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class StartupValidationService {
  private readonly logger = new Logger(StartupValidationService.name);

  constructor(private readonly configService: ConfigService) {}

  async validateConfiguration(): Promise<void> {
    this.logger.log('🔍 Starting configuration validation...');

    // Validate Firebase Configuration
    await this.validateFirebaseConfig();

    // Validate Database Configuration
    this.validateDatabaseConfig();

    // Validate Environment Variables
    this.validateEnvironmentVariables();

    this.logger.log('✅ All configuration validation completed successfully');
  }

  private async validateFirebaseConfig(): Promise<void> {
    this.logger.log('🔥 Validating Firebase configuration...');

    const firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    };

    // Check if all required Firebase config is present
    const missingConfig = [];
    if (!firebaseConfig.projectId) missingConfig.push('FIREBASE_PROJECT_ID');
    if (!firebaseConfig.privateKey) missingConfig.push('FIREBASE_PRIVATE_KEY');
    if (!firebaseConfig.clientEmail) missingConfig.push('FIREBASE_CLIENT_EMAIL');

    if (missingConfig.length > 0) {
      this.logger.error('❌ Missing Firebase configuration:');
      missingConfig.forEach(config => this.logger.error(`   - ${config}`));
      throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
    }

    // Test Firebase Admin SDK initialization
    try {
      if (admin.apps.length === 0) {
        this.logger.error('❌ Firebase Admin SDK not initialized!');
        throw new Error('Firebase Admin SDK not initialized');
      }

      // Test Firebase Auth service
      const auth = admin.auth();
      this.logger.log('✅ Firebase Admin SDK is properly initialized');
      this.logger.log(`🎯 Project ID: ${firebaseConfig.projectId}`);

      // Test token verification with a dummy call (this will fail but confirms the service is working)
      try {
        await auth.verifyIdToken('dummy-token');
      } catch (error: any) {
        if (error.code === 'auth/argument-error') {
          this.logger.log('✅ Firebase Auth service is responding correctly');
        } else {
          this.logger.warn('⚠️  Unexpected Firebase Auth response:', error.message);
        }
      }

    } catch (error: any) {
      this.logger.error('❌ Firebase validation failed:', error.message);
      throw new Error(`Firebase validation failed: ${error.message}`);
    }
  }

  private validateDatabaseConfig(): void {
    this.logger.log('🗄️  Validating database configuration...');

    const dbConfig = {
      host: process.env.DB_HOST || this.configService.get('DB_HOST'),
      port: process.env.DB_PORT || this.configService.get('DB_PORT'),
      username: process.env.DB_USERNAME || this.configService.get('DB_USERNAME'),
      password: process.env.DB_PASSWORD || this.configService.get('DB_PASSWORD'),
      database: process.env.DB_DATABASE || this.configService.get('DB_DATABASE'),
    };

    const missingDbConfig = [];
    if (!dbConfig.host) missingDbConfig.push('DB_HOST');
    if (!dbConfig.port) missingDbConfig.push('DB_PORT');
    if (!dbConfig.username) missingDbConfig.push('DB_USERNAME');
    if (!dbConfig.database) missingDbConfig.push('DB_DATABASE');

    if (missingDbConfig.length > 0) {
      this.logger.warn('⚠️  Missing database configuration:');
      missingDbConfig.forEach(config => this.logger.warn(`   - ${config}`));
    } else {
      this.logger.log('✅ Database configuration is complete');
    }
  }

  private validateEnvironmentVariables(): void {
    this.logger.log('🌍 Validating environment variables...');

    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => 
      !process.env[envVar] && !this.configService.get(envVar)
    );

    if (missingEnvVars.length > 0) {
      this.logger.warn('⚠️  Missing environment variables:');
      missingEnvVars.forEach(envVar => this.logger.warn(`   - ${envVar}`));
    } else {
      this.logger.log('✅ Required environment variables are set');
    }

    this.logger.log(`🌍 Environment: ${process.env.NODE_ENV || this.configService.get('NODE_ENV') || 'development'}`);
    this.logger.log(`🚪 Port: ${process.env.PORT || this.configService.get('PORT') || 3001}`);
  }
} 
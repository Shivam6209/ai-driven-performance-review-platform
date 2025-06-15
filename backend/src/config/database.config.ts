import { registerAs } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Employee } from '../modules/employees/entities/employee.entity';
import { Department } from '../modules/departments/entities/department.entity';
import { OKR } from '../modules/okrs/entities/okr.entity';
import { Feedback } from '../modules/feedback/entities/feedback.entity';
import { PerformanceReview } from '../modules/reviews/entities/performance-review.entity';
import { ReviewCycle } from '../modules/reviews/entities/review-cycle.entity';
import { ReviewTemplate } from '../modules/reviews/entities/review-template.entity';
import { ReviewSection } from '../modules/reviews/entities/review-section.entity';
import { ReviewTemplateSection } from '../modules/reviews/entities/review-template-section.entity';
import { ReviewWorkflowStep } from '../modules/reviews/entities/review-workflow-step.entity';
import { FeedbackTag } from '../modules/feedback/entities/feedback-tag.entity';
import { FeedbackResponse } from '../modules/feedback/entities/feedback-response.entity';
import { OKRUpdate } from '../modules/okrs/entities/okr-update.entity';
import { OkrTag } from '../modules/okrs/entities/okr-tag.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const createDatabaseConnection = (): DataSource => {
  console.log('🔧 Database Configuration:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Username: ${process.env.DB_USERNAME}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
      User,
      Employee,
      Department,
      OKR,
      OKRUpdate,
      OkrTag,
      Feedback,
      FeedbackTag,
      FeedbackResponse,
      PerformanceReview,
      ReviewCycle,
      ReviewTemplate,
      ReviewTemplateSection,
      ReviewSection,
      ReviewWorkflowStep,
    ],
    synchronize: false, // Don't auto-sync in production
    logging: false,
    ssl: {
      rejectUnauthorized: false, // For cloud databases like Aiven
    },
  });
};

export const getDatabaseConfig = () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DB_USERNAME || process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.DATABASE_NAME || 'performance_review_platform',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
  poolSize: parseInt(process.env.DB_POOL_SIZE || '1', 10),
  extra: {
    max: parseInt(process.env.DB_POOL_SIZE || '1', 10),
    min: 1,
    acquire: 30000,
    idle: 10000,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
    rejectUnauthorized: false
  } : false,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
})); 
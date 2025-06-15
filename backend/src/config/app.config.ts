import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  },
})); 
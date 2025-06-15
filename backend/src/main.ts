import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { initializeFirebaseAdmin } from './config/firebase-admin';
import { StartupValidationService } from './config/startup-validation.service';

async function bootstrap() {
  console.log('🚀 Starting AI-Driven Performance Review Platform...');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Initialize Firebase Admin FIRST
  console.log('🔥 Initializing Firebase Admin SDK...');
  initializeFirebaseAdmin(configService);

  // Validate all configurations
  console.log('🔍 Validating server configuration...');
  const validationService = new StartupValidationService(configService);
  try {
    await validationService.validateConfiguration();
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    console.error('🛑 Server startup aborted due to configuration errors');
    process.exit(1);
  }

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  app.use(compression());

  // Enhanced CORS configuration
  const frontendUrl = configService.get('frontendUrl') || 'http://localhost:3000';
  const corsAllowedOrigins = configService.get('CORS_ALLOWED_ORIGINS');
  
  // Build allowed origins array
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'https://127.0.0.1:3000',
  ];

  // Add additional origins from environment if specified
  if (corsAllowedOrigins) {
    const additionalOrigins = corsAllowedOrigins.split(',').map((origin: string) => origin.trim());
    allowedOrigins.push(...additionalOrigins);
  }

  // Remove duplicates
  const uniqueOrigins = [...new Set(allowedOrigins)];

  console.log('CORS Configuration:');
  console.log('- Allowed Origins:', uniqueOrigins);
  console.log('- Frontend URL:', frontendUrl);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        console.log('CORS: Allowing request with no origin');
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (uniqueOrigins.includes(origin)) {
        console.log(`CORS: Allowing origin: ${origin}`);
        return callback(null, true);
      }

      // In development, be more permissive
      if (configService.get('nodeEnv') === 'development') {
        console.log(`CORS: Allowing origin in development: ${origin}`);
        return callback(null, true);
      }

      console.error(`CORS: Blocking origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-HTTP-Method-Override',
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  });

  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Performance Review Platform API')
    .setDescription('API documentation for the AI-Driven Performance Review & OKR Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start server
  const port = configService.get('port');
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap(); 
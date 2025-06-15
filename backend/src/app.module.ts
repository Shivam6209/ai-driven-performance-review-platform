import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from './modules/employees/employees.module';
import { AuthModule } from './modules/auth/auth.module';
import { OkrModule } from './modules/okr/okr.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AiModule } from './modules/ai/ai.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EmailModule } from './modules/email/email.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import databaseConfig, { redisConfig } from './config/database.config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import emailConfig from './config/email.config';
import aiConfig from './config/ai.config';
import firebaseConfig from './config/firebase.config';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, appConfig, authConfig, emailConfig, aiConfig, firebaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
    }),
    ...(process.env.REDIS_HOST || process.env.REDIS_URL ? [
      RedisModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const redisHost = configService.get('redis.host');
          const redisPort = configService.get('redis.port');
          const redisUrl = configService.get('redis.url');
          
          return {
            type: 'single',
            url: redisUrl || `redis://${redisHost}:${redisPort}`,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          };
        },
      })
    ] : []),
    EmployeesModule,
    AuthModule,
    OkrModule,
    FeedbackModule,
    ReviewsModule,
    DepartmentsModule,
    RbacModule,
    ComplianceModule,
    AiModule,
    ProjectsModule,
    EmailModule,
    IntegrationsModule,
    DocumentationModule,
    DashboardModule,
    OrganizationsModule,
    InvitationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {} 
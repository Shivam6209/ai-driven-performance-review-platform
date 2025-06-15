import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { Integration } from './entities/integration.entity';
import { IntegrationLog } from './entities/integration-log.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { HrSystemService } from './services/hr-system.service';
import { SsoService } from './services/sso.service';
import { CalendarService } from './services/calendar.service';
import { NotificationService } from './services/notification.service';
import { WebhookService } from './services/webhook.service';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, IntegrationLog, WebhookEndpoint]),
    RbacModule,
  ],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    HrSystemService,
    SsoService,
    CalendarService,
    NotificationService,
    WebhookService,
  ],
  exports: [
    IntegrationsService,
    HrSystemService,
    SsoService,
    CalendarService,
    NotificationService,
    WebhookService,
  ],
})
export class IntegrationsModule {} 
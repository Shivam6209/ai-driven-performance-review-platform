import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './entities/integration.entity';
import { IntegrationLog } from './entities/integration-log.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
// import { Cron, CronExpression } from '@nestjs/schedule'; // Temporarily disabled

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    @InjectRepository(IntegrationLog)
    private integrationLogRepository: Repository<IntegrationLog>,
    @InjectRepository(WebhookEndpoint)
    private webhookEndpointRepository: Repository<WebhookEndpoint>,
  ) {}

  // Integration CRUD operations
  async createIntegration(createIntegrationDto: CreateIntegrationDto): Promise<Integration> {
    const integration = this.integrationRepository.create(createIntegrationDto);
    const savedIntegration = await this.integrationRepository.save(integration);
    
    await this.logIntegrationActivity(
      savedIntegration.id,
      'create',
      'success',
      'Integration created successfully'
    );
    
    return savedIntegration;
  }

  async getAllIntegrations(): Promise<Integration[]> {
    return this.integrationRepository.find({
      relations: ['logs'],
      order: { created_at: 'DESC' },
    });
  }

  async getIntegrationById(id: string): Promise<Integration> {
    const integration = await this.integrationRepository.findOne({
      where: { id },
      relations: ['logs'],
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    return integration;
  }

  async updateIntegration(id: string, updateIntegrationDto: UpdateIntegrationDto): Promise<Integration> {
    const integration = await this.getIntegrationById(id);
    
    Object.assign(integration, updateIntegrationDto);
    const updatedIntegration = await this.integrationRepository.save(integration);
    
    await this.logIntegrationActivity(
      id,
      'update',
      'success',
      'Integration updated successfully'
    );
    
    return updatedIntegration;
  }

  async deleteIntegration(id: string): Promise<void> {
    const integration = await this.getIntegrationById(id);
    
    await this.integrationRepository.remove(integration);
    
    await this.logIntegrationActivity(
      id,
      'delete',
      'success',
      'Integration deleted successfully'
    );
  }

  // Webhook endpoint management
  async createWebhookEndpoint(createWebhookEndpointDto: CreateWebhookEndpointDto): Promise<WebhookEndpoint> {
    const webhook = this.webhookEndpointRepository.create(createWebhookEndpointDto);
    return this.webhookEndpointRepository.save(webhook);
  }

  async getAllWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    return this.webhookEndpointRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getWebhookEndpointById(id: string): Promise<WebhookEndpoint> {
    const webhook = await this.webhookEndpointRepository.findOne({
      where: { id },
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook endpoint with ID ${id} not found`);
    }

    return webhook;
  }

  // Integration health monitoring
  async checkIntegrationHealth(id: string): Promise<{ status: string; message: string }> {
    const integration = await this.getIntegrationById(id);
    
    try {
      // Perform health check based on integration type
      let healthResult;
      
      switch (integration.type) {
        case 'hr_system':
          healthResult = await this.checkHrSystemHealth(integration);
          break;
        case 'sso':
          healthResult = await this.checkSsoHealth(integration);
          break;
        case 'calendar':
          healthResult = await this.checkCalendarHealth(integration);
          break;
        case 'notification':
          healthResult = await this.checkNotificationHealth(integration);
          break;
        default:
          healthResult = { status: 'unknown', message: 'Health check not implemented for this integration type' };
      }
      
      // Update integration health status
      integration.health_status = healthResult.status as any;
      integration.health_message = healthResult.message;
      await this.integrationRepository.save(integration);
      
      await this.logIntegrationActivity(
        id,
        'health_check',
        healthResult.status === 'healthy' ? 'success' : 'warning',
        healthResult.message
      );
      
      return healthResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      this.logger.error(`Health check failed for integration ${integration.id}: ${errorMessage}`);
      return {
        status: 'error',
        message: errorMessage,
      };
    }
  }

  // Scheduled health checks
  // @Cron(CronExpression.EVERY_HOUR) // Temporarily disabled due to crypto issue
  async performScheduledHealthChecks(): Promise<void> {
    this.logger.log('Starting scheduled health checks for all integrations');
    
    const activeIntegrations = await this.integrationRepository.find({
      where: { is_active: true },
    });
    
    for (const integration of activeIntegrations) {
      try {
        await this.checkIntegrationHealth(integration.id);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Health check failed for integration ${integration.id}: ${errorMessage}`);
      }
    }
    
    this.logger.log(`Completed health checks for ${activeIntegrations.length} integrations`);
  }

  // Integration activity logging
  async logIntegrationActivity(
    integrationId: string,
    operation: string,
    status: 'success' | 'warning' | 'error',
    message: string,
    requestData?: any,
    responseData?: any,
    errorDetails?: any,
    durationMs?: number,
    externalId?: string
  ): Promise<IntegrationLog> {
    const log = this.integrationLogRepository.create({
      integration_id: integrationId,
      operation,
      status,
      message,
      request_data: requestData,
      response_data: responseData,
      error_details: errorDetails,
      duration_ms: durationMs,
      external_id: externalId,
    });
    
    return this.integrationLogRepository.save(log);
  }

  // Get integration logs with pagination
  async getIntegrationLogs(
    integrationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: IntegrationLog[]; total: number }> {
    const [logs, total] = await this.integrationLogRepository.findAndCount({
      where: { integration_id: integrationId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return { logs, total };
  }

  // Private health check methods
  private async checkHrSystemHealth(_integration: Integration): Promise<{ status: string; message: string }> {
    // Mock implementation - replace with actual HR system health check
    return { status: 'healthy', message: 'HR system connection is healthy' };
  }

  private async checkSsoHealth(_integration: Integration): Promise<{ status: string; message: string }> {
    // Mock implementation - replace with actual SSO health check
    return { status: 'healthy', message: 'SSO connection is healthy' };
  }

  private async checkCalendarHealth(_integration: Integration): Promise<{ status: string; message: string }> {
    // Mock implementation - replace with actual calendar health check
    return { status: 'healthy', message: 'Calendar integration is healthy' };
  }

  private async checkNotificationHealth(_integration: Integration): Promise<{ status: string; message: string }> {
    // Mock implementation - replace with actual notification health check
    return { status: 'healthy', message: 'Notification service is healthy' };
  }
} 
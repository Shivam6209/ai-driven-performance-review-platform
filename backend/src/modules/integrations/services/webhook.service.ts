import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';
import { IntegrationLog } from '../entities/integration-log.entity';
import * as crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  source: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private webhookEndpointRepository: Repository<WebhookEndpoint>,
    @InjectRepository(IntegrationLog)
    private integrationLogRepository: Repository<IntegrationLog>,
  ) {}

  /**
   * Trigger webhooks for a specific event
   */
  async triggerWebhooks(event: string, data: any): Promise<void> {
    this.logger.log(`Triggering webhooks for event: ${event}`);

    const webhooks = await this.webhookEndpointRepository.find({
      where: {
        is_active: true,
        events: event, // This would need proper array contains query in real implementation
      },
    });

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      source: 'performai',
    };

    for (const webhook of webhooks) {
      // Process webhooks in parallel for better performance
      this.deliverWebhook(webhook, payload).catch(error => {
        this.logger.error(`Failed to deliver webhook ${webhook.id}: ${error.message}`);
      });
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  async deliverWebhook(webhook: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= webhook.max_retries) {
      try {
        await this.sendWebhookRequest(webhook, payload);
        
        // Update success metrics
        webhook.success_count++;
        webhook.last_triggered_at = new Date();
        await this.webhookEndpointRepository.save(webhook);

        // Log successful delivery
        await this.logWebhookDelivery(
          webhook.id,
          'success',
          'Webhook delivered successfully',
          payload,
          null,
          Date.now() - startTime
        );

        this.logger.log(`Webhook ${webhook.id} delivered successfully on attempt ${attempt + 1}`);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempt++;
        
        if (attempt <= webhook.max_retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          this.logger.warn(`Webhook ${webhook.id} failed on attempt ${attempt}, retrying in ${delay}ms`);
        }
      }
    }

    // All attempts failed
    webhook.failure_count++;
    await this.webhookEndpointRepository.save(webhook);

    // Log failed delivery
    await this.logWebhookDelivery(
      webhook.id,
      'error',
      `Webhook delivery failed after ${webhook.max_retries + 1} attempts`,
      payload,
      { error: lastError?.message, stack: lastError?.stack },
      Date.now() - startTime
    );

    this.logger.error(`Webhook ${webhook.id} failed after ${webhook.max_retries + 1} attempts: ${lastError?.message}`);
  }

  /**
   * Send HTTP request to webhook endpoint
   */
  private async sendWebhookRequest(webhook: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'PerformAI-Webhook/1.0',
      ...webhook.headers,
    };

    // Add signature if secret is configured
    if (webhook.secret) {
      const signature = this.generateSignature(body, webhook.secret);
      headers['X-PerformAI-Signature'] = signature;
    }

    // Mock HTTP request - replace with actual HTTP client
    this.logger.debug(`Sending webhook to ${webhook.url} with method ${webhook.method}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate random failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }
  }

  /**
   * Generate webhook signature for verification
   */
  private generateSignature(body: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(body, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Log webhook delivery attempt
   */
  private async logWebhookDelivery(
    webhookId: string,
    status: 'success' | 'warning' | 'error',
    message: string,
    requestData: any,
    errorDetails?: any,
    durationMs?: number
  ): Promise<void> {
    const log = this.integrationLogRepository.create({
      integration_id: webhookId, // Using webhook ID as integration ID for logging
      operation: 'webhook_delivery',
      status,
      message,
      request_data: requestData,
      error_details: errorDetails,
      duration_ms: durationMs,
    });

    await this.integrationLogRepository.save(log);
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    try {
      const webhook = await this.webhookEndpointRepository.findOne({
        where: { id: webhookId },
      });

      if (!webhook) {
        return { success: false, message: 'Webhook endpoint not found' };
      }

      const testPayload: WebhookPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook' },
        source: 'performai',
      };

      await this.deliverWebhook(webhook, testPayload);
      return { success: true, message: 'Test webhook delivered successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test webhook failed';
      return { success: false, message: `Test webhook failed: ${errorMessage}` };
    }
  }
} 
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @RequirePermissions('integrations', 'create')
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({ status: 201, description: 'Integration created successfully' })
  async createIntegration(
    @Body() createIntegrationDto: CreateIntegrationDto,
    @Request() req: any,
  ) {
    if (!createIntegrationDto.created_by && req.user) {
      createIntegrationDto.created_by = req.user.userId;
    }
    return this.integrationsService.createIntegration(createIntegrationDto);
  }

  @Get()
  @RequirePermissions('integrations', 'read')
  @ApiOperation({ summary: 'Get all integrations' })
  @ApiResponse({ status: 200, description: 'List of integrations' })
  async getAllIntegrations() {
    return this.integrationsService.getAllIntegrations();
  }

  @Get(':id')
  @RequirePermissions('integrations', 'read')
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiResponse({ status: 200, description: 'Integration details' })
  async getIntegrationById(@Param('id') id: string) {
    return this.integrationsService.getIntegrationById(id);
  }

  @Patch(':id')
  @RequirePermissions('integrations', 'update')
  @ApiOperation({ summary: 'Update integration' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  async updateIntegration(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.updateIntegration(id, updateIntegrationDto);
  }

  @Delete(':id')
  @RequirePermissions('integrations', 'delete')
  @ApiOperation({ summary: 'Delete integration' })
  @ApiResponse({ status: 200, description: 'Integration deleted successfully' })
  async deleteIntegration(@Param('id') id: string) {
    return this.integrationsService.deleteIntegration(id);
  }

  @Post(':id/health-check')
  @RequirePermissions('integrations', 'update')
  @ApiOperation({ summary: 'Check integration health' })
  @ApiResponse({ status: 200, description: 'Health check result' })
  async checkIntegrationHealth(@Param('id') id: string) {
    return this.integrationsService.checkIntegrationHealth(id);
  }

  @Get(':id/logs')
  @RequirePermissions('integrations', 'read')
  @ApiOperation({ summary: 'Get integration logs' })
  @ApiResponse({ status: 200, description: 'Integration logs' })
  async getIntegrationLogs(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.integrationsService.getIntegrationLogs(id, page, limit);
  }

  // Webhook endpoints
  @Post('webhooks')
  @RequirePermissions('integrations', 'create')
  @ApiOperation({ summary: 'Create webhook endpoint' })
  @ApiResponse({ status: 201, description: 'Webhook endpoint created successfully' })
  async createWebhookEndpoint(
    @Body() createWebhookEndpointDto: CreateWebhookEndpointDto,
    @Request() req: any,
  ) {
    if (!createWebhookEndpointDto.created_by && req.user) {
      createWebhookEndpointDto.created_by = req.user.userId;
    }
    return this.integrationsService.createWebhookEndpoint(createWebhookEndpointDto);
  }

  @Get('webhooks')
  @RequirePermissions('integrations', 'read')
  @ApiOperation({ summary: 'Get all webhook endpoints' })
  @ApiResponse({ status: 200, description: 'List of webhook endpoints' })
  async getAllWebhookEndpoints() {
    return this.integrationsService.getAllWebhookEndpoints();
  }

  @Get('webhooks/:id')
  @RequirePermissions('integrations', 'read')
  @ApiOperation({ summary: 'Get webhook endpoint by ID' })
  @ApiResponse({ status: 200, description: 'Webhook endpoint details' })
  async getWebhookEndpointById(@Param('id') id: string) {
    return this.integrationsService.getWebhookEndpointById(id);
  }
} 
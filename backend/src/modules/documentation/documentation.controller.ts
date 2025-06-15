import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentationService } from './documentation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('documentation')
@Controller('documentation')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get('api-docs')
  @RequirePermissions('documentation', 'read')
  @ApiOperation({ summary: 'Get API documentation' })
  @ApiResponse({ status: 200, description: 'API documentation retrieved successfully' })
  async getApiDocumentation() {
    return this.documentationService.generateApiDocumentation();
  }

  @Get('user-guides')
  @RequirePermissions('documentation', 'read')
  @ApiOperation({ summary: 'Get user guides' })
  @ApiResponse({ status: 200, description: 'User guides retrieved successfully' })
  async getUserGuides() {
    return this.documentationService.generateUserGuides();
  }

  @Get('integration-docs')
  @RequirePermissions('documentation', 'read')
  @ApiOperation({ summary: 'Get integration documentation' })
  @ApiResponse({ status: 200, description: 'Integration documentation retrieved successfully' })
  async getIntegrationDocs() {
    return this.documentationService.generateIntegrationDocs();
  }

  @Get('changelog')
  @ApiOperation({ summary: 'Get changelog' })
  @ApiResponse({ status: 200, description: 'Changelog retrieved successfully' })
  async getChangelog() {
    return this.documentationService.generateChangelog();
  }

  @Post('generate')
  @RequirePermissions('documentation', 'create')
  @ApiOperation({ summary: 'Generate all documentation' })
  @ApiResponse({ status: 201, description: 'Documentation generated successfully' })
  @HttpCode(HttpStatus.CREATED)
  async generateAllDocumentation() {
    const [apiDocs, userGuides, integrationDocs, changelog] = await Promise.all([
      this.documentationService.generateApiDocumentation(),
      this.documentationService.generateUserGuides(),
      this.documentationService.generateIntegrationDocs(),
      this.documentationService.generateChangelog(),
    ]);

    return {
      message: 'All documentation generated successfully',
      generated: {
        apiDocs: !!apiDocs,
        userGuides: userGuides.length,
        integrationDocs: !!integrationDocs,
        changelog: !!changelog,
      },
    };
  }
} 
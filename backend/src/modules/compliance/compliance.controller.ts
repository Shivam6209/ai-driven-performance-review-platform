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
import { ComplianceService } from './compliance.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { CreateDataRetentionPolicyDto } from './dto/create-data-retention-policy.dto';
import { UpdateDataRetentionPolicyDto } from './dto/update-data-retention-policy.dto';
import { AuditLogSearchDto } from './dto/audit-log-search.dto';
import { ComplianceReportDto } from './dto/compliance-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  // Audit log endpoints
  @Post('audit-logs')
  @ApiOperation({ summary: 'Create an audit log entry' })
  @ApiResponse({ status: 201, description: 'Audit log created successfully' })
  createAuditLog(@Body() createAuditLogDto: CreateAuditLogDto, @Request() req: any) {
    // Add actor information if not provided
    if (!createAuditLogDto.actor_id && req.user) {
      createAuditLogDto.actor_id = req.user.userId;
      createAuditLogDto.actor_type = 'employee';
    }
    
    // Add IP address if available
    if (!createAuditLogDto.actor_ip && req.ip) {
      createAuditLogDto.actor_ip = req.ip;
    }
    
    return this.complianceService.createAuditLog(createAuditLogDto);
  }

  @Get('audit-logs')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'read_audit_logs')
  @ApiOperation({ summary: 'Search audit logs' })
  searchAuditLogs(@Query() searchDto: AuditLogSearchDto) {
    return this.complianceService.searchAuditLogs(searchDto);
  }

  @Get('audit-logs/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'read_audit_logs')
  @ApiOperation({ summary: 'Get an audit log by ID' })
  getAuditLogById(@Param('id') id: string) {
    return this.complianceService.getAuditLogById(id);
  }

  // Data retention policy endpoints
  @Post('retention-policies')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'create_retention_policy')
  @ApiOperation({ summary: 'Create a data retention policy' })
  @ApiResponse({ status: 201, description: 'Data retention policy created successfully' })
  createDataRetentionPolicy(
    @Body() createDataRetentionPolicyDto: CreateDataRetentionPolicyDto,
    @Request() req: any
  ) {
    // Add creator information if not provided
    if (!createDataRetentionPolicyDto.created_by && req.user) {
      createDataRetentionPolicyDto.created_by = req.user.userId;
    }
    
    return this.complianceService.createDataRetentionPolicy(createDataRetentionPolicyDto);
  }

  @Get('retention-policies')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'read_retention_policies')
  @ApiOperation({ summary: 'Get all data retention policies' })
  getAllDataRetentionPolicies() {
    return this.complianceService.getAllDataRetentionPolicies();
  }

  @Get('retention-policies/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'read_retention_policies')
  @ApiOperation({ summary: 'Get a data retention policy by ID' })
  getDataRetentionPolicyById(@Param('id') id: string) {
    return this.complianceService.getDataRetentionPolicyById(id);
  }

  @Patch('retention-policies/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'update_retention_policy')
  @ApiOperation({ summary: 'Update a data retention policy' })
  updateDataRetentionPolicy(
    @Param('id') id: string,
    @Body() updateDataRetentionPolicyDto: UpdateDataRetentionPolicyDto
  ) {
    return this.complianceService.updateDataRetentionPolicy(id, updateDataRetentionPolicyDto);
  }

  @Delete('retention-policies/:id')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'delete_retention_policy')
  @ApiOperation({ summary: 'Delete a data retention policy' })
  deleteDataRetentionPolicy(@Param('id') id: string) {
    return this.complianceService.deleteDataRetentionPolicy(id);
  }

  // Compliance report endpoints
  @Post('reports')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'generate_reports')
  @ApiOperation({ summary: 'Generate a compliance report' })
  generateComplianceReport(@Body() reportDto: ComplianceReportDto) {
    return this.complianceService.generateComplianceReport(reportDto);
  }

  // Manual execution of data retention policies
  @Post('retention-policies/execute')
  @UseGuards(RbacGuard)
  @RequirePermissions('compliance', 'execute_retention_policies')
  @ApiOperation({ summary: 'Manually execute data retention policies' })
  executeDataRetentionPolicies() {
    return this.complianceService.executeDataRetentionPolicies();
  }
} 
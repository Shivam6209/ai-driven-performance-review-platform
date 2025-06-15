import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { DataRetentionPolicy } from './entities/data-retention-policy.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { CreateDataRetentionPolicyDto } from './dto/create-data-retention-policy.dto';
import { UpdateDataRetentionPolicyDto } from './dto/update-data-retention-policy.dto';
import { AuditLogSearchDto } from './dto/audit-log-search.dto';
import { ComplianceReportDto } from './dto/compliance-report.dto';
// import { Cron, CronExpression } from '@nestjs/schedule'; // Temporarily disabled

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(DataRetentionPolicy)
    private dataRetentionPolicyRepository: Repository<DataRetentionPolicy>,
  ) {}

  // Audit log methods
  async createAuditLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async searchAuditLogs(searchDto: AuditLogSearchDto): Promise<{ data: AuditLog[]; total: number }> {
    const { 
      startDate, 
      endDate, 
      eventType, 
      resourceType, 
      resourceId, 
      actorId, 
      status,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortDirection = 'DESC'
    } = searchDto;

    // Build query
    const query: any = {};
    
    if (startDate && endDate) {
      query.created_at = Between(new Date(startDate), new Date(endDate));
    }
    
    if (eventType) {
      query.event_type = eventType;
    }
    
    if (resourceType) {
      query.resource_type = resourceType;
    }
    
    if (resourceId) {
      query.resource_id = resourceId;
    }
    
    if (actorId) {
      query.actor_id = actorId;
    }
    
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const [data, total] = await this.auditLogRepository.findAndCount({
      where: query,
      order: { [sortBy]: sortDirection },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async getAuditLogById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({ where: { id } });
  }

  // Data retention policy methods
  async createDataRetentionPolicy(createDataRetentionPolicyDto: CreateDataRetentionPolicyDto): Promise<DataRetentionPolicy> {
    const policy = this.dataRetentionPolicyRepository.create({
      ...createDataRetentionPolicyDto,
      conditions: createDataRetentionPolicyDto.conditions ? JSON.parse(createDataRetentionPolicyDto.conditions) : undefined,
    });
    return await this.dataRetentionPolicyRepository.save(policy);
  }

  async updateDataRetentionPolicy(
    id: string,
    updateDataRetentionPolicyDto: UpdateDataRetentionPolicyDto
  ): Promise<DataRetentionPolicy> {
    const policy = await this.getDataRetentionPolicyById(id);
    if (!policy) {
      throw new NotFoundException(`Data retention policy with ID ${id} not found`);
    }
    Object.assign(policy, updateDataRetentionPolicyDto);
    return this.dataRetentionPolicyRepository.save(policy);
  }

  async getDataRetentionPolicyById(id: string): Promise<DataRetentionPolicy | null> {
    return this.dataRetentionPolicyRepository.findOne({ where: { id } });
  }

  async getAllDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    return this.dataRetentionPolicyRepository.find();
  }

  async deleteDataRetentionPolicy(id: string): Promise<void> {
    const policy = await this.dataRetentionPolicyRepository.findOne({ where: { id } });
    
    if (!policy) {
      throw new Error(`Data retention policy with id ${id} not found`);
    }
    
    await this.dataRetentionPolicyRepository.remove(policy);
  }

  // Compliance report methods
  async generateComplianceReport(reportDto: ComplianceReportDto): Promise<any> {
    const { startDate, endDate, reportType } = reportDto;
    
    switch (reportType) {
      case 'audit_activity':
        return this.generateAuditActivityReport(startDate, endDate);
      case 'data_retention':
        return this.generateDataRetentionReport();
      case 'access_control':
        return this.generateAccessControlReport(startDate, endDate);
      case 'data_privacy':
        return this.generateDataPrivacyReport(startDate, endDate);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  private async generateAuditActivityReport(startDate: string, endDate: string): Promise<any> {
    // Get audit logs for the period
    const auditLogs = await this.auditLogRepository.find({
      where: {
        created_at: Between(new Date(startDate), new Date(endDate)),
      },
    });
    
    // Count by event type
    const eventTypeCounts: Record<string, number> = {};
    const resourceTypeCounts: Record<string, number> = {};
    const actorActivityCounts: Record<string, number> = {};
    
    auditLogs.forEach(log => {
      // Count by event type
      eventTypeCounts[log.event_type] = (eventTypeCounts[log.event_type] || 0) + 1;
      
      // Count by resource type
      resourceTypeCounts[log.resource_type] = (resourceTypeCounts[log.resource_type] || 0) + 1;
      
      // Count by actor
      if (log.actor_id) {
        actorActivityCounts[log.actor_id] = (actorActivityCounts[log.actor_id] || 0) + 1;
      }
    });
    
    // Get top actors by activity
    const topActors = Object.entries(actorActivityCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 10)
      .map(([actorId, count]) => ({ actorId, count }));
    
    return {
      period: { startDate, endDate },
      totalEvents: auditLogs.length,
      eventTypeSummary: eventTypeCounts,
      resourceTypeSummary: resourceTypeCounts,
      topActors,
    };
  }

  private async generateDataRetentionReport(): Promise<any> {
    // Get all policies
    const policies = await this.dataRetentionPolicyRepository.find();
    
    // Group by resource type
    const policyByResourceType: Record<string, any[]> = {};
    
    policies.forEach(policy => {
      if (!policyByResourceType[policy.resource_type]) {
        policyByResourceType[policy.resource_type] = [];
      }
      
      policyByResourceType[policy.resource_type].push({
        id: policy.id,
        name: policy.name,
        retentionPeriodDays: policy.retention_period_days,
        isEnabled: policy.is_enabled,
        lastExecutionDate: policy.last_execution_date,
      });
    });
    
    return {
      totalPolicies: policies.length,
      enabledPolicies: policies.filter(p => p.is_enabled).length,
      policyByResourceType,
    };
  }

  private async generateAccessControlReport(startDate: string, endDate: string): Promise<any> {
    // Get access-related audit logs
    const accessLogs = await this.auditLogRepository.find({
      where: {
        created_at: Between(new Date(startDate), new Date(endDate)),
        event_type: 'access',
      },
    });
    
    // Count access by status
    const accessByStatus = {
      allowed: 0,
      denied: 0,
    };
    
    // Count access by resource
    const accessByResource: Record<string, number> = {};
    
    // Count denied access by actor
    const deniedAccessByActor: Record<string, number> = {};
    
    accessLogs.forEach(log => {
      // Count by status
      if (log.status === 'success') {
        accessByStatus.allowed++;
      } else if (log.status === 'failure') {
        accessByStatus.denied++;
        
        // Count denied access by actor
        if (log.actor_id) {
          deniedAccessByActor[log.actor_id] = (deniedAccessByActor[log.actor_id] || 0) + 1;
        }
      }
      
      // Count by resource
      const resourceKey = `${log.resource_type}:${log.resource_id || 'all'}`;
      accessByResource[resourceKey] = (accessByResource[resourceKey] || 0) + 1;
    });
    
    // Get top resources by access attempts
    const topResources = Object.entries(accessByResource)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));
    
    // Get top actors with denied access
    const topDeniedActors = Object.entries(deniedAccessByActor)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 10)
      .map(([actorId, count]) => ({ actorId, count }));
    
    return {
      period: { startDate, endDate },
      totalAccessAttempts: accessLogs.length,
      accessByStatus,
      topResources,
      topDeniedActors,
    };
  }

  private async generateDataPrivacyReport(startDate: string, endDate: string): Promise<any> {
    // Get privacy-related audit logs
    const privacyLogs = await this.auditLogRepository.find({
      where: {
        created_at: Between(new Date(startDate), new Date(endDate)),
        event_type: 'data_access',
      },
    });
    
    // Count access by data category
    const accessByDataCategory: Record<string, number> = {};
    
    // Count access by purpose
    const accessByPurpose: Record<string, number> = {};
    
    privacyLogs.forEach(log => {
      // Extract data category and purpose from metadata
      const dataCategory = (log.metadata as any)?.data_category || 'unknown';
      const purpose = (log.metadata as any)?.purpose || 'unknown';
      
      // Count by data category
      accessByDataCategory[dataCategory] = (accessByDataCategory[dataCategory] || 0) + 1;
      
      // Count by purpose
      accessByPurpose[purpose] = (accessByPurpose[purpose] || 0) + 1;
    });
    
    return {
      period: { startDate, endDate },
      totalDataAccess: privacyLogs.length,
      accessByDataCategory,
      accessByPurpose,
    };
  }

  // Data retention execution
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Temporarily disabled due to crypto issue
  async executeDataRetentionPolicies(): Promise<void> {
    try {
      this.logger.log('Executing data retention policies');
      
      // Get all enabled policies
      const enabledPolicies = await this.dataRetentionPolicyRepository.find({
        where: { is_enabled: true },
      });
      
      for (const policy of enabledPolicies) {
        await this.executeDataRetentionPolicy(policy);
      }
      
      this.logger.log(`Completed execution of ${enabledPolicies.length} data retention policies`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error executing data retention policies';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error executing data retention policies: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  private async executeDataRetentionPolicy(policy: DataRetentionPolicy): Promise<void> {
    this.logger.log(`Executing data retention policy: ${policy.name}`);
    
    try {
      // Build query based on policy
      const query: any = {
        where: {},
      };

      // Add date filter
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);
      query.where.created_at = { $lt: cutoffDate };

      // Add conditions from policy if they exist
      if (policy.conditions) {
        Object.keys(policy.conditions).forEach(key => {
          query.where[key] = policy.conditions![key];
        });
      }

      // Execute based on archive strategy
      switch (policy.archive_strategy) {
        case 'delete':
          await this.executeDeleteStrategy(policy, query);
          break;
        case 'anonymize':
          await this.executeAnonymizeStrategy(policy, query);
          break;
        case 'archive':
          await this.executeArchiveStrategy(policy, query);
          break;
      }

      // Update last execution date
      policy.last_execution_date = new Date();
      await this.dataRetentionPolicyRepository.save(policy);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error executing data retention policy';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error executing data retention policy ${policy.name}: ${errorMessage}`,
        errorStack
      );
      throw error;
    }
  }

  private async executeDeleteStrategy(_policy: DataRetentionPolicy, query: any): Promise<void> {
    const result = await this.auditLogRepository.delete(query);
    this.logger.log(`Deleted ${result.affected} audit logs`);
  }

  private async executeAnonymizeStrategy(_policy: DataRetentionPolicy, query: any): Promise<void> {
    const logsToAnonymize = await this.auditLogRepository.find({ where: query });
    
    for (const log of logsToAnonymize) {
      // Anonymize sensitive fields
      log.actor_id = 'anonymized';
      log.actor_ip = 'anonymized';
      
      // Anonymize data in before/after state
      if (log.before_state && typeof log.before_state === 'object') {
        this.anonymizeData(log.before_state);
      }
      
      if (log.after_state && typeof log.after_state === 'object') {
        this.anonymizeData(log.after_state);
      }
      
      await this.auditLogRepository.save(log);
    }
    
    this.logger.log(`Anonymized ${logsToAnonymize.length} audit logs`);
  }

  private async executeArchiveStrategy(_policy: DataRetentionPolicy, _query: any): Promise<void> {
    // Archive implementation would depend on storage strategy
    // This is a placeholder for the actual implementation
    this.logger.log('Archive strategy not implemented yet');
  }

  private anonymizeData(data: Record<string, any>): void {
    // List of fields to anonymize
    const sensitiveFields = [
      'email',
      'name',
      'phone',
      'address',
      'ip',
      'user_id',
      'employee_id',
      'personal_data',
    ];
    
    // Recursively anonymize data
    for (const key of Object.keys(data)) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        data[key] = 'anonymized';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        this.anonymizeData(data[key]);
      }
    }
  }
} 
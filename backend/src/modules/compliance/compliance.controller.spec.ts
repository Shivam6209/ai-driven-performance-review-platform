import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { CreateDataRetentionPolicyDto } from './dto/create-data-retention-policy.dto';
import { AuditLogSearchDto } from './dto/audit-log-search.dto';
import { ComplianceReportDto } from './dto/compliance-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/guards/rbac.guard';

const mockComplianceService = {
  createAuditLog: jest.fn(),
  searchAuditLogs: jest.fn(),
  getAuditLogById: jest.fn(),
  createDataRetentionPolicy: jest.fn(),
  getAllDataRetentionPolicies: jest.fn(),
  getDataRetentionPolicyById: jest.fn(),
  updateDataRetentionPolicy: jest.fn(),
  deleteDataRetentionPolicy: jest.fn(),
  generateComplianceReport: jest.fn(),
  executeDataRetentionPolicies: jest.fn(),
};

describe('ComplianceController', () => {
  let controller: ComplianceController;
  let service: ComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [
        {
          provide: ComplianceService,
          useValue: mockComplianceService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ComplianceController>(ComplianceController);
    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAuditLog', () => {
    it('should create an audit log', () => {
      const createAuditLogDto: CreateAuditLogDto = {
        event_type: 'create',
        resource_type: 'employee',
      };

      const req = {
        user: { id: 'user-1' },
        ip: '127.0.0.1',
      };

      const expectedDto = {
        ...createAuditLogDto,
        actor_id: 'user-1',
        actor_type: 'employee',
        actor_ip: '127.0.0.1',
      };

      const expectedResult = {
        id: 'audit-123',
        actor_id: 'user-123',
        actor_type: 'employee',
        actor_ip: '192.168.1.1',
        event_type: 'create',
        resource_type: 'feedback',
        resource_id: 'feedback-456',
        before_state: undefined,
        after_state: { content: 'New feedback' },
        metadata: { source: 'web' },
        status: 'success',
        status_message: 'Created successfully',
        created_at: new Date(),
      };

      jest.spyOn(service, 'createAuditLog').mockResolvedValue(expectedResult);

      expect(controller.createAuditLog(createAuditLogDto, req)).resolves.toEqual(expectedResult);
      expect(service.createAuditLog).toHaveBeenCalledWith(expectedDto);
    });
  });

  describe('searchAuditLogs', () => {
    it('should search audit logs', () => {
      const searchDto: AuditLogSearchDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      const expectedResult = {
        data: [
          { 
            id: 'log-1', 
            event_type: 'create', 
            resource_type: 'employee',
            actor_id: 'user-1',
            actor_type: 'employee',
            actor_ip: '127.0.0.1',
            resource_id: 'resource-123',
            before_state: undefined,
            after_state: undefined,
            metadata: undefined,
            status: 'success',
            status_message: undefined,
            created_at: new Date(),
          },
          { 
            id: 'log-2', 
            event_type: 'update', 
            resource_type: 'employee',
            actor_id: 'user-2',
            actor_type: 'employee',
            actor_ip: '127.0.0.1',
            resource_id: 'resource-123',
            before_state: undefined,
            after_state: undefined,
            metadata: undefined,
            status: 'success',
            status_message: undefined,
            created_at: new Date(),
          },
        ],
        total: 2,
      };

      jest.spyOn(service, 'searchAuditLogs').mockResolvedValue(expectedResult);

      expect(controller.searchAuditLogs(searchDto)).resolves.toEqual(expectedResult);
      expect(service.searchAuditLogs).toHaveBeenCalledWith(searchDto);
    });
  });

  describe('getAuditLogById', () => {
    it('should get an audit log by id', () => {
      const id = 'audit-log-1';
      const expectedResult = { 
        id, 
        event_type: 'create', 
        resource_type: 'employee',
        actor_id: 'user-1',
        actor_type: 'employee',
        actor_ip: '127.0.0.1',
        resource_id: 'resource-123',
        before_state: undefined,
        after_state: undefined,
        metadata: undefined,
        status: 'success',
        status_message: undefined,
        created_at: new Date(),
      };

      jest.spyOn(service, 'getAuditLogById').mockResolvedValue(expectedResult);

      expect(controller.getAuditLogById(id)).resolves.toEqual(expectedResult);
      expect(service.getAuditLogById).toHaveBeenCalledWith(id);
    });
  });

  describe('createDataRetentionPolicy', () => {
    it('should create a data retention policy', () => {
      const createPolicyDto: CreateDataRetentionPolicyDto = {
        name: 'Test Policy',
        resource_type: 'audit_logs',
        retention_period_days: 365,
      };

      const req = {
        user: { id: 'user-1' },
      };

      const expectedDto = {
        ...createPolicyDto,
        created_by: 'user-1',
      };

      const expectedResult = { 
        id: 'policy-1', 
        ...expectedDto,
        description: expectedDto.description || 'Test policy description',
        is_enabled: expectedDto.is_enabled ?? true,
        filters: expectedDto.filters || {},
        archive_strategy: expectedDto.archive_strategy || 'delete',
        archive_config: expectedDto.archive_config || {},
        last_execution_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as any;

      jest.spyOn(service, 'createDataRetentionPolicy').mockResolvedValue(expectedResult);

      expect(controller.createDataRetentionPolicy(createPolicyDto, req)).resolves.toEqual(expectedResult);
      expect(service.createDataRetentionPolicy).toHaveBeenCalledWith(expectedDto);
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate a compliance report', () => {
      const reportDto: ComplianceReportDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        reportType: 'audit_activity',
      };

      const expectedResult = {
        period: { startDate: '2023-01-01', endDate: '2023-12-31' },
        totalEvents: 10,
        eventTypeSummary: { create: 5, update: 3, delete: 2 },
      };

      jest.spyOn(service, 'generateComplianceReport').mockResolvedValue(expectedResult);

      expect(controller.generateComplianceReport(reportDto)).resolves.toEqual(expectedResult);
      expect(service.generateComplianceReport).toHaveBeenCalledWith(reportDto);
    });
  });
}); 
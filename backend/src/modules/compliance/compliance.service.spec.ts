import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ComplianceService } from './compliance.service';
import { AuditLog } from './entities/audit-log.entity';
import { DataRetentionPolicy } from './entities/data-retention-policy.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { CreateDataRetentionPolicyDto } from './dto/create-data-retention-policy.dto';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
});

describe('ComplianceService', () => {
  let service: ComplianceService;
  let auditLogRepository: MockRepository<AuditLog>;
  let dataRetentionPolicyRepository: MockRepository<DataRetentionPolicy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(DataRetentionPolicy),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    auditLogRepository = module.get<MockRepository<AuditLog>>(getRepositoryToken(AuditLog));
    dataRetentionPolicyRepository = module.get<MockRepository<DataRetentionPolicy>>(
      getRepositoryToken(DataRetentionPolicy)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuditLog', () => {
    it('should create and return an audit log', async () => {
      const createAuditLogDto: CreateAuditLogDto = {
        event_type: 'create',
        resource_type: 'employee',
        resource_id: 'test-id',
        actor_id: 'user-1',
        actor_type: 'employee',
      };

      const auditLog = { id: 'test-audit-log-id', ...createAuditLogDto };

      auditLogRepository.create!.mockReturnValue(auditLog);
      auditLogRepository.save!.mockResolvedValue(auditLog);

      const result = await service.createAuditLog(createAuditLogDto);

      expect(auditLogRepository.create).toHaveBeenCalledWith(createAuditLogDto);
      expect(auditLogRepository.save).toHaveBeenCalledWith(auditLog);
      expect(result).toEqual(auditLog);
    });
  });

  describe('searchAuditLogs', () => {
    it('should return audit logs based on search criteria', async () => {
      const searchDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        eventType: 'create',
        page: 1,
        limit: 10,
      };

      const auditLogs = [
        { id: 'log-1', event_type: 'create', resource_type: 'employee' },
        { id: 'log-2', event_type: 'create', resource_type: 'review' },
      ];

      auditLogRepository.findAndCount!.mockResolvedValue([auditLogs, 2]);

      const result = await service.searchAuditLogs(searchDto);

      expect(auditLogRepository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({ data: auditLogs, total: 2 });
    });
  });

  describe('createDataRetentionPolicy', () => {
    it('should create and return a data retention policy', async () => {
      const createPolicyDto: CreateDataRetentionPolicyDto = {
        name: 'Test Policy',
        resource_type: 'audit_logs',
        retention_period_days: 365,
      };

      const policy = { id: 'test-policy-id', ...createPolicyDto };

      dataRetentionPolicyRepository.create!.mockReturnValue(policy);
      dataRetentionPolicyRepository.save!.mockResolvedValue(policy);

      const result = await service.createDataRetentionPolicy(createPolicyDto);

      expect(dataRetentionPolicyRepository.create).toHaveBeenCalledWith(createPolicyDto);
      expect(dataRetentionPolicyRepository.save).toHaveBeenCalledWith(policy);
      expect(result).toEqual(policy);
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate an audit activity report', async () => {
      const reportDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        reportType: 'audit_activity' as const,
      };

      const auditLogs = [
        { id: 'log-1', event_type: 'create', resource_type: 'employee', actor_id: 'user-1' },
        { id: 'log-2', event_type: 'update', resource_type: 'employee', actor_id: 'user-2' },
        { id: 'log-3', event_type: 'create', resource_type: 'review', actor_id: 'user-1' },
      ];

      auditLogRepository.find!.mockResolvedValue(auditLogs);

      const result = await service.generateComplianceReport(reportDto);

      expect(auditLogRepository.find).toHaveBeenCalled();
      expect(result).toHaveProperty('totalEvents', 3);
      expect(result).toHaveProperty('eventTypeSummary');
      expect(result).toHaveProperty('resourceTypeSummary');
      expect(result).toHaveProperty('topActors');
    });

    it('should generate a data retention report', async () => {
      const reportDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        reportType: 'data_retention' as const,
      };

      const policies = [
        { id: 'policy-1', resource_type: 'audit_logs', is_enabled: true },
        { id: 'policy-2', resource_type: 'reviews', is_enabled: false },
      ];

      dataRetentionPolicyRepository.find!.mockResolvedValue(policies);

      const result = await service.generateComplianceReport(reportDto);

      expect(dataRetentionPolicyRepository.find).toHaveBeenCalled();
      expect(result).toHaveProperty('totalPolicies', 2);
      expect(result).toHaveProperty('enabledPolicies', 1);
      expect(result).toHaveProperty('policyByResourceType');
    });
  });
}); 
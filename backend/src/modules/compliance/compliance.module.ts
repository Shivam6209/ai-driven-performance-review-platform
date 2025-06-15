import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ScheduleModule } from '@nestjs/schedule';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { AuditLog } from './entities/audit-log.entity';
import { DataRetentionPolicy } from './entities/data-retention-policy.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, DataRetentionPolicy]),
    // ScheduleModule.forRoot(), // Temporarily disabled due to crypto issue
    RbacModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {} 
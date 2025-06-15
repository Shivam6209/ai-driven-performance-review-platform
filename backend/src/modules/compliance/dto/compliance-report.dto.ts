import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class ComplianceReportDto {
  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @IsEnum(['audit_activity', 'data_retention', 'access_control', 'data_privacy'])
  @IsNotEmpty()
  reportType!: 'audit_activity' | 'data_retention' | 'access_control' | 'data_privacy';

  @IsString()
  @IsOptional()
  format?: 'json' | 'csv' | 'pdf';
} 
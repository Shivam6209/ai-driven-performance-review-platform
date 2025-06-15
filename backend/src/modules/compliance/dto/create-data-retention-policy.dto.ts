import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsObject, IsIn } from 'class-validator';

export class CreateDataRetentionPolicyDto {
  @ApiProperty({ description: 'Policy name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Policy description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of resource this policy applies to (e.g., "audit_logs", "reviews")' })
  @IsString()
  @IsNotEmpty()
  resource_type!: string;

  @ApiProperty({ description: 'Retention period in days' })
  @IsNumber()
  @IsNotEmpty()
  retention_period_days!: number;

  @ApiProperty({ description: 'Whether the policy is enabled', default: false })
  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean;

  @ApiProperty({ description: 'Additional filters for the policy', required: false })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({
    description: 'Archive strategy',
    enum: ['delete', 'anonymize', 'archive'],
    required: false,
  })
  @IsString()
  @IsIn(['delete', 'anonymize', 'archive'])
  @IsOptional()
  archive_strategy?: 'delete' | 'anonymize' | 'archive';

  @ApiProperty({ description: 'Archive configuration', required: false })
  @IsObject()
  @IsOptional()
  archive_config?: Record<string, any>;

  @ApiProperty({ description: 'ID of the employee who created the policy', required: false })
  @IsString()
  @IsOptional()
  created_by?: string;

  @IsString()
  @IsOptional()
  conditions?: string;
} 
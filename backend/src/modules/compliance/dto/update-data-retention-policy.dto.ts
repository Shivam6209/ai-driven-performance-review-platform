import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, IsIn } from 'class-validator';

export class UpdateDataRetentionPolicyDto {
  @ApiProperty({ description: 'Policy name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Policy description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of resource this policy applies to', required: false })
  @IsString()
  @IsOptional()
  resource_type?: string;

  @ApiProperty({ description: 'Retention period in days', required: false })
  @IsNumber()
  @IsOptional()
  retention_period_days?: number;

  @ApiProperty({ description: 'Whether the policy is enabled', required: false })
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
} 
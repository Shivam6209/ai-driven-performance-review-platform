import { IsString, IsNotEmpty, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Integration name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Integration type', enum: ['hr_system', 'sso', 'calendar', 'notification', 'webhook'] })
  @IsEnum(['hr_system', 'sso', 'calendar', 'notification', 'webhook'])
  @IsNotEmpty()
  type!: 'hr_system' | 'sso' | 'calendar' | 'notification' | 'webhook';

  @ApiProperty({ description: 'Integration provider (e.g., workday, okta, google_calendar)' })
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @ApiProperty({ description: 'Integration configuration object' })
  @IsObject()
  @IsNotEmpty()
  configuration!: Record<string, any>;

  @ApiProperty({ description: 'Integration credentials', required: false })
  @IsObject()
  @IsOptional()
  credentials?: Record<string, any>;

  @ApiProperty({ description: 'Whether integration is active', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'Whether integration is in test mode', default: false })
  @IsBoolean()
  @IsOptional()
  is_test_mode?: boolean;

  @ApiProperty({ description: 'ID of user who created the integration', required: false })
  @IsOptional()
  @IsString()
  created_by?: string;
} 
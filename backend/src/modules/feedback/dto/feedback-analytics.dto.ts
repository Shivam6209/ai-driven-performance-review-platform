import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';

export class FeedbackAnalyticsDto {
  @ApiProperty({ description: 'Start date for analytics', required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ description: 'End date for analytics', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({ 
    description: 'Analytics type', 
    enum: ['frequency', 'quality', 'sentiment', 'response_time', 'action_completion'],
    required: false
  })
  @IsEnum(['frequency', 'quality', 'sentiment', 'response_time', 'action_completion'])
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Team ID for team analytics', required: false })
  @IsUUID()
  @IsOptional()
  team_id?: string;

  @ApiProperty({ description: 'Department ID for department analytics', required: false })
  @IsUUID()
  @IsOptional()
  department_id?: string;
} 
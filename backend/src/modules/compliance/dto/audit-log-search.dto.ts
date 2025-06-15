import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditLogSearchDto {
  @ApiProperty({ description: 'Start date for search (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date for search (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Event type filter', required: false })
  @IsString()
  @IsOptional()
  eventType?: string;

  @ApiProperty({ description: 'Resource type filter', required: false })
  @IsString()
  @IsOptional()
  resourceType?: string;

  @ApiProperty({ description: 'Resource ID filter', required: false })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiProperty({ description: 'Actor ID filter', required: false })
  @IsString()
  @IsOptional()
  actorId?: string;

  @ApiProperty({ description: 'Status filter', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', default: 10, required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Field to sort by', default: 'created_at', required: false })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ description: 'Sort direction', default: 'DESC', enum: ['ASC', 'DESC'], required: false })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortDirection?: 'ASC' | 'DESC';
} 
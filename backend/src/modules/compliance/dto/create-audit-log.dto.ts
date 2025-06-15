import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'Type of event (e.g., "create", "update", "delete", "access")' })
  @IsString()
  @IsNotEmpty()
  event_type!: string;

  @ApiProperty({ description: 'Type of resource (e.g., "employee", "review", "feedback")' })
  @IsString()
  @IsNotEmpty()
  resource_type!: string;

  @ApiProperty({ description: 'ID of the resource', required: false })
  @IsString()
  @IsOptional()
  resource_id?: string;

  @ApiProperty({ description: 'State before the change', required: false })
  @IsObject()
  @IsOptional()
  before_state?: Record<string, any>;

  @ApiProperty({ description: 'State after the change', required: false })
  @IsObject()
  @IsOptional()
  after_state?: Record<string, any>;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'ID of the actor who performed the action', required: false })
  @IsString()
  @IsOptional()
  actor_id?: string;

  @ApiProperty({ description: 'Type of actor (e.g., "employee", "system")', required: false })
  @IsString()
  @IsOptional()
  actor_type?: string;

  @ApiProperty({ description: 'IP address of the actor', required: false })
  @IsString()
  @IsOptional()
  actor_ip?: string;

  @ApiProperty({ description: 'Status of the action (e.g., "success", "failure")', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Status message or error details', required: false })
  @IsString()
  @IsOptional()
  status_message?: string;
} 
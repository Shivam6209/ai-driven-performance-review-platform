import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Feedback content' })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @ApiProperty({ description: 'Receiver ID' })
  @IsNotEmpty()
  @IsUUID()
  receiver_id!: string;

  @ApiProperty({
    description: 'Feedback type',
    enum: ['general', 'appreciation', 'constructive', 'goal_related', 'project_related'],
    default: 'general'
  })
  @IsEnum(['general', 'appreciation', 'constructive', 'goal_related', 'project_related'])
  @IsOptional()
  feedback_type?: string;

  @ApiProperty({
    description: 'Visibility setting',
    enum: ['public', 'private', 'manager_only', 'hr_only'],
    default: 'private'
  })
  @IsEnum(['public', 'private', 'manager_only', 'hr_only'])
  @IsOptional()
  visibility?: string;

  @ApiProperty({ description: 'Context type (e.g., project, goal)', required: false })
  @IsString()
  @IsOptional()
  context_type?: string;

  @ApiProperty({ description: 'Context ID', required: false })
  @IsUUID()
  @IsOptional()
  context_id?: string;

  @ApiProperty({ description: 'Whether feedback is anonymous', default: false })
  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;

  @ApiProperty({ description: 'Array of tag IDs', required: false, type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tag_ids?: string[];

  @IsUUID()
  @IsOptional()
  parentFeedbackId?: string;
} 
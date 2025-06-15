import { IsString, IsNotEmpty, IsUrl, IsEnum, IsObject, IsArray, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookEndpointDto {
  @ApiProperty({ description: 'Webhook endpoint name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Webhook URL' })
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({ description: 'Webhook description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'HTTP method',
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    default: 'POST'
  })
  @IsEnum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  @IsNotEmpty()
  method!: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  @ApiProperty({ description: 'HTTP headers', required: false })
  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @ApiProperty({ 
    description: 'Events that trigger this webhook',
    type: [String],
    example: ['review.created', 'feedback.submitted']
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  events!: string[];

  @ApiProperty({ description: 'Whether webhook is active', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ description: 'Secret for webhook signature verification', required: false })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiProperty({ description: 'Maximum number of retries', default: 3 })
  @IsNumber()
  @IsOptional()
  max_retries?: number;

  @ApiProperty({ description: 'Timeout in seconds', default: 30 })
  @IsNumber()
  @IsOptional()
  timeout_seconds?: number;

  @ApiProperty({ description: 'ID of user who created the webhook', required: false })
  @IsString()
  @IsOptional()
  created_by?: string;
} 
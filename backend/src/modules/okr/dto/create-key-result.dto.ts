import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDate, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKeyResultDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @IsNumber()
  @IsOptional()
  startValue?: number;

  @IsString()
  @IsNotEmpty()
  format!: string;

  @IsUUID()
  @IsNotEmpty()
  objectiveId!: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsEnum(['not_started', 'in_progress', 'completed', 'at_risk'])
  @IsOptional()
  status?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate!: Date;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
} 
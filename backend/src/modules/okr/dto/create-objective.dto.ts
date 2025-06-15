import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDate, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateObjectiveDto {
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

  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @IsEnum(['company', 'department', 'team', 'individual'])
  level!: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  parentObjectiveId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(['draft', 'active', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
} 
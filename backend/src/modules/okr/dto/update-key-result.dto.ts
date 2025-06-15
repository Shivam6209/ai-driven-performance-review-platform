import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { CreateKeyResultDto } from './create-key-result.dto';

export class UpdateKeyResultDto extends PartialType(CreateKeyResultDto) {
  @IsString()
  @IsOptional()
  updateComment?: string;

  @IsUUID()
  @IsOptional()
  updatedById?: string;
} 
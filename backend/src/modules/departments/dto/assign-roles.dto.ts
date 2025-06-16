import { IsOptional, IsString, IsArray } from 'class-validator';

export class AssignRolesDto {
  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hrIds?: string[];
} 
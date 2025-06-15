import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ProjectRole {
  OWNER = 'owner',
  LEAD = 'lead',
  MEMBER = 'member',
  CONTRIBUTOR = 'contributor',
}

export class CreateProjectMemberDto {
  @IsUUID()
  @IsNotEmpty()
  projectId!: string;

  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @IsEnum(ProjectRole)
  @IsOptional()
  role?: ProjectRole;

  @IsDateString()
  @IsOptional()
  joined_date?: string;
} 
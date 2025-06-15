import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateOkrUpdateDto {
  @IsUUID()
  @IsNotEmpty()
  keyResultId!: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsNotEmpty()
  previousValue!: number;

  @IsNumber()
  @IsNotEmpty()
  newValue!: number;

  @IsString()
  @IsOptional()
  evidence?: string;

  @IsUUID()
  @IsOptional()
  updatedById?: string;
} 
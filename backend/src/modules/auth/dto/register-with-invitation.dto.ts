import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterWithInvitationDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ example: 'abc123def456...' })
  @IsString()
  @IsNotEmpty()
  invitationToken!: string;
} 
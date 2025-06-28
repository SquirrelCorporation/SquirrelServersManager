import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @ApiProperty({ description: 'User email' })
  email!: string;

  @ApiProperty({ description: 'User role' })
  role!: string;

  @ApiProperty({ description: 'User API key', required: false })
  apiKey?: string;

  @ApiProperty({ description: 'User terminal logs level', required: false })
  terminal?: any;
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'user'], default: 'admin' })
  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: string = 'admin';
}

export class UpdateLogsLevelDto {
  @ApiProperty({ description: 'Terminal logs level (0=debug, 1=info, 2=warn, 3=error)' })
  @IsEnum([0, 1, 2, 3])
  @IsNotEmpty()
  terminal!: number;
}

export class RegenerateApiKeyResponseDto {
  @ApiProperty({ description: 'New API key' })
  apiKey!: string;
}

export class UserExistenceResponseDto {
  @ApiProperty({ description: 'Whether users exist in the system' })
  hasUsers!: boolean;
}

export class UpdateLogsLevelResponseDto {
  @ApiProperty({ description: 'Updated user data', type: UserDto })
  data!: UserDto;
}

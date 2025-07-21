import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * DTO for cron job response
 */
export class GetCronResponseDto {
  @IsString()
  name!: string;

  @IsString()
  expression!: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  lastExecution?: Date;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

// For backward compatibility
export type CronResponseDto = GetCronResponseDto;

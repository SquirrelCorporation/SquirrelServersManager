import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CronResponseDto {
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
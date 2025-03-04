import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TaskLogsQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsObject()
  sort?: Record<string, 1 | -1>;

  @IsOptional()
  @IsObject()
  filter?: Record<string, any>;
}

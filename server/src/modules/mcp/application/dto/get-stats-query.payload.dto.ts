import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetStatsQueryPayloadDto {
  @IsOptional()
  @IsString()
  metricName?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}

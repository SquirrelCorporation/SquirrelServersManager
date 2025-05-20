import { IsArray, IsDateString } from 'class-validator';

export class DashboardPerformanceStatsResponseDto {
  currentMem!: number;

  previousMem!: number;

  currentCpu!: number;

  previousCpu!: number;

  message!: string;

  danger!: boolean;
}

export class DashboardAvailabilityStatsResponseDto {
  availability!: number;

  lastMonth!: number;

  byDevice!: Array<{
    uuid: string;
    name: string;
    availability: number;
  }>;
}

export class DashboardStatQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class DashboardAveragedStatsQueryDto extends DashboardStatQueryDto {
  @IsArray()
  devices!: string[];
}

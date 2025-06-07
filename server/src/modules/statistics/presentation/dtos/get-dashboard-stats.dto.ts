import { IsArray, IsDateString } from 'class-validator';

/**
 * DTO for dashboard performance stats response
 */
export class GetDashboardPerformanceStatsResponseDto {
  currentMem!: number;

  previousMem!: number;

  currentCpu!: number;

  previousCpu!: number;

  message!: string;

  danger!: boolean;
}

/**
 * DTO for dashboard availability stats response
 */
export class GetDashboardAvailabilityStatsResponseDto {
  availability!: number;

  lastMonth!: number;

  byDevice!: Array<{
    uuid: string;
    name: string;
    availability: number;
  }>;
}

/**
 * DTO for dashboard stat query
 */
export class QueryDashboardStatDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

/**
 * DTO for dashboard averaged stats query
 */
export class QueryDashboardAveragedStatsDto extends QueryDashboardStatDto {
  @IsArray()
  devices!: string[];
}

// For backward compatibility
export type DashboardPerformanceStatsResponseDto = GetDashboardPerformanceStatsResponseDto;
export type DashboardAvailabilityStatsResponseDto = GetDashboardAvailabilityStatsResponseDto;
export type DashboardStatQueryDto = QueryDashboardStatDto;
export type DashboardAveragedStatsQueryDto = QueryDashboardAveragedStatsDto;

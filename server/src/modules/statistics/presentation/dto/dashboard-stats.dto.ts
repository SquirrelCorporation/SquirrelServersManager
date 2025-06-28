import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsString } from 'class-validator';

export class DashboardPerformanceStatsResponseDto {
  @ApiProperty({ description: 'Current memory usage' })
  currentMem!: number;

  @ApiProperty({ description: 'Previous memory usage' })
  previousMem!: number;

  @ApiProperty({ description: 'Current CPU usage' })
  currentCpu!: number;

  @ApiProperty({ description: 'Previous CPU usage' })
  previousCpu!: number;

  @ApiProperty({ description: 'Status message' })
  message!: string;

  @ApiProperty({ description: 'Whether the status is dangerous' })
  danger!: boolean;
}

export class DashboardAvailabilityStatsResponseDto {
  @ApiProperty({ description: 'Overall availability percentage' })
  availability!: number;

  @ApiProperty({ description: 'Last month availability percentage' })
  lastMonth!: number;

  @ApiProperty({
    description: 'Availability by device',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        uuid: { type: 'string' },
        uptime: { type: 'number' },
        downtime: { type: 'number' },
        availability: { type: 'string' },
      },
    },
  })
  byDevice!: Array<{
    uuid: string;
    uptime: number;
    downtime: number;
    availability: string;
  }>;
}

export class DashboardStatQueryDto {
  @ApiProperty({ description: 'Start date for statistics', example: '2023-01-01T00:00:00.000Z' })
  @IsDateString()
  from!: string;

  @ApiProperty({ description: 'End date for statistics', example: '2023-12-31T23:59:59.999Z' })
  @IsDateString()
  to!: string;
}

export class DashboardAveragedStatsQueryDto extends DashboardStatQueryDto {
  @ApiProperty({ description: 'Array of device UUIDs', type: [String] })
  @IsArray()
  devices!: string[];
}

export class GetStatsByDevicesDto {
  @ApiProperty({ description: 'Array of device UUIDs to get statistics for', type: [String] })
  @IsArray()
  @IsString({ each: true })
  devices!: string[];
}

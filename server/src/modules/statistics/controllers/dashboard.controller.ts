import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DateTime } from 'luxon';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { DashboardStatQueryDto } from '../dto/dashboard-stats.dto';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard/stats')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('performances')
  async getDashboardPerformanceStats() {
    const result = await this.dashboardService.getSystemPerformance();
    return result;
  }

  @Get('availability')
  async getDashboardAvailabilityStats() {
    const result = await this.dashboardService.getDevicesAvailability();
    return {
      availability: result.availability,
      lastMonth: result.lastMonth,
      byDevice: result.byDevice,
    };
  }

  @Post('averaged/:type')
  async getDashboardAveragedStats(
    @Param('type') type: string,
    @Query() query: DashboardStatQueryDto,
    @Body() body: { devices: string[] },
  ) {
    const { from, to } = query;
    const { devices } = body;

    const devicesToQuery = await DeviceRepo.findByUuids(devices);
    if (!devicesToQuery || devicesToQuery.length !== devices.length) {
      throw new Error('Some devices were not found');
    }

    const fromDate = DateTime.fromJSDate(new Date(from.split('T')[0]))
      .endOf('day')
      .toJSDate();
    const toDate = DateTime.fromJSDate(new Date(to.split('T')[0]))
      .endOf('day')
      .toJSDate();

    const stats = await this.dashboardService.getAveragedStatsByDevices(
      devices,
      fromDate,
      toDate,
      type,
    );

    return stats;
  }

  @Post(':type')
  async getDashboardStat(@Param('type') type: string, @Query() query: DashboardStatQueryDto) {
    const { from, to } = query;

    const fromDate = DateTime.fromJSDate(new Date(from.split('T')[0]))
      .endOf('day')
      .toJSDate();
    const toDate = DateTime.fromJSDate(new Date(to.split('T')[0]))
      .endOf('day')
      .toJSDate();

    const stats = await this.dashboardService.getDashboardStat(fromDate, toDate, type);
    return stats;
  }
}

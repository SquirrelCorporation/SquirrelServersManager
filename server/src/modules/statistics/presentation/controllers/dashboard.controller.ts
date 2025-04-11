import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import {
  BadRequestException,
  EntityNotFoundException,
} from '../../../../infrastructure/exceptions';
import { DashboardService } from '../../application/services/dashboard.service';
import { DashboardStatQueryDto } from '../dto/dashboard-stats.dto';

@Controller('statistics/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
  ) {}

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
  async getSingleAveragedStatsByDevicesAndType(
    @Param('type') type: string,
    @Query() query: DashboardStatQueryDto,
    @Body() body: { devices: string[] },
  ) {
    const { from, to } = query;
    const { devices } = body;

    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      throw new BadRequestException('No devices specified in request body');
    }

    if (!from || !to) {
      throw new BadRequestException('Missing required date range parameters (from, to)');
    }

    const devicesToQuery = await this.devicesService.findByUuids(devices);
    if (!devicesToQuery || devicesToQuery.length === 0) {
      throw new EntityNotFoundException('Device', 'None of the requested devices were found');
    }

    if (devicesToQuery.length !== devices.length) {
      // We found some but not all devices
      const missingCount = devices.length - devicesToQuery.length;
      throw new EntityNotFoundException(
        'Device',
        `${missingCount} of ${devices.length} requested devices were not found`,
      );
    }

    const fromDate = DateTime.fromJSDate(new Date(from.split('T')[0]))
      .endOf('day')
      .toJSDate();
    const toDate = DateTime.fromJSDate(new Date(to.split('T')[0]))
      .endOf('day')
      .toJSDate();

    const stats = await this.dashboardService.getSingleAveragedStatsByDevicesAndType(
      devices,
      fromDate,
      toDate,
      type,
    );

    return stats;
  }

  @Post('stats/:type')
  async getStatsByDevicesAndType(
    @Param('type') type: string,
    @Body() body: { devices: string[] },
    @Query() query: DashboardStatQueryDto,
  ) {
    const { from, to } = query;
    const { devices } = body;

    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      throw new BadRequestException('No devices specified in request body');
    }

    if (!from || !to) {
      throw new BadRequestException('Missing required date range parameters (from, to)');
    }

    if (!type || typeof type !== 'string') {
      throw new BadRequestException('Invalid statistic type parameter');
    }

    const fromDate = DateTime.fromJSDate(new Date(from.split('T')[0]))
      .endOf('day')
      .toJSDate();
    const toDate = DateTime.fromJSDate(new Date(to.split('T')[0]))
      .endOf('day')
      .toJSDate();
    const devicesToQuery = await this.devicesService.findByUuids(devices);
    if (!devicesToQuery || devicesToQuery.length === 0) {
      throw new EntityNotFoundException('Device', 'None of the requested devices were found');
    }

    if (devicesToQuery.length !== devices.length) {
      // We found some but not all devices
      const missingCount = devices.length - devicesToQuery.length;
      throw new EntityNotFoundException(
        'Device',
        `${missingCount} of ${devices.length} requested devices were not found`,
      );
    }
    const stats = await this.dashboardService.getStatsByDevicesAndType(
      devicesToQuery,
      fromDate,
      toDate,
      type,
    );
    return stats;
  }
}

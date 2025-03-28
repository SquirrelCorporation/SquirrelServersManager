import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import {
  DEVICES_SERVICE,
  IDevicesService,
} from '@modules/devices';
import { DeviceStatsService } from '../../application/services/device-stats.service';
import { DeviceStatsParamsDto, DeviceStatsQueryDto } from '../dto/device-stats.dto';

@Controller('statistics/devices')
@UseGuards(JwtAuthGuard)
export class DeviceStatsController {
  constructor(
    private readonly deviceStatsService: DeviceStatsService,
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
  ) {}

  @Get(':uuid/stats/:type')
  async getDeviceStatsByDeviceUuid(
    @Param() params: DeviceStatsParamsDto,
    @Query() query: DeviceStatsQueryDto,
  ) {
    const { uuid, type } = params;
    const { from, to } = query;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const toDate = to ? new Date(to) : new Date();

    const stats = await this.deviceStatsService.getStatsByDeviceAndType(
      device,
      fromDate,
      toDate,
      type,
    );

    return stats;
  }

  @Get(':uuid/stat/:type')
  async getDeviceStatByDeviceUuid(@Param() params: DeviceStatsParamsDto) {
    const { uuid, type } = params;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const stat = await this.deviceStatsService.getStatByDeviceAndType(device, type);
    return stat;
  }
}

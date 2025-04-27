import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { DateTime } from 'luxon';
import { DeviceStatsService } from '../../application/services/device-stats.service';
import { DeviceStatsParamsDto, DeviceStatsQueryDto } from '../dto/device-stats.dto';
import { DEVICE_STATS_SERVICE } from '../../domain/interfaces/device-stats-service.interface';

@Controller('statistics/devices')
export class DeviceStatsController {
  constructor(
    @Inject(DEVICE_STATS_SERVICE)
    private readonly deviceStatsService: DeviceStatsService,
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
  ) {}

  @Get(':uuid/stats/:type')
  async getDeviceStatsByDeviceUuid(
    @Param() params: DeviceStatsParamsDto,
    @Query() query: DeviceStatsQueryDto,
  ) {
    const { uuid, type } = params;
    const { from = 24 } = query;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const toDate = DateTime.now().toJSDate();
    const fromDate = DateTime.now()
      .minus({ hours: from as number })
      .toJSDate();

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

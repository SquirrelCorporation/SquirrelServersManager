import { Injectable } from '@nestjs/common';
import PinoLogger from '../../../logger';
import DeviceDownTimeUseCases from '../../../services/DeviceDownTimeUseCases';

@Injectable()
export class DeviceDownTimeService {
  private readonly logger = PinoLogger.child(
    { module: 'DeviceDownTimeService' },
    { msgPrefix: '[DEVICE_DOWNTIME] - ' },
  );

  constructor() {}

  async getDevicesAvailabilitySumUpCurrentMonthLastMonth() {
    this.logger.info('getDevicesAvailabilitySumUpCurrentMonthLastMonth');

    // For now, we'll use the existing use case implementation
    // In the future, we can migrate this logic directly into this service
    return DeviceDownTimeUseCases.getDevicesAvailabilitySumUpCurrentMonthLastMonth();
  }
}

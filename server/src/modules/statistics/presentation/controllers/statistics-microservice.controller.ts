import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetStatsQueryPayloadDto } from '@modules/mcp/application/dto/get-stats-query.payload.dto';
import { TimeseriesDataPointDto } from '@modules/mcp/application/dto/timeseries-stats.response.dto';
import {
  DEVICE_STATS_SERVICE,
  IDeviceStatsService,
} from '@modules/statistics/domain/interfaces/device-stats-service.interface';

@Controller()
export class StatisticsMicroserviceController {
  private readonly logger = new Logger(StatisticsMicroserviceController.name);

  constructor(@Inject(DEVICE_STATS_SERVICE) private readonly statsService: IDeviceStatsService) {}

  @MessagePattern({ cmd: 'core_get_timeseries_stats' })
  async getTimeseriesStats(
    @Payload() payload: GetStatsQueryPayloadDto,
  ): Promise<TimeseriesDataPointDto[] | null> {
    this.logger.log(
      `Handling core_get_timeseries_stats via MessagePattern: ${JSON.stringify(payload)}`,
    );
    if (!payload.metricName || !payload.startTime || !payload.endTime) {
      this.logger.warn('Missing required parameters in core_get_timeseries_stats payload');
      // Consider throwing RpcException
      throw new Error('Missing required parameters: metricName, startTime, endTime');
    }
    // Delegate to the service method
    // Note: The service method might need adjustment to accept the DTO directly or extract params
    return this.statsService.getAveragedStatsByType(
      new Date(payload.startTime),
      new Date(payload.endTime),
      payload.metricName,
    );
  }

  // Add other message patterns for statistics-related core commands if needed
}

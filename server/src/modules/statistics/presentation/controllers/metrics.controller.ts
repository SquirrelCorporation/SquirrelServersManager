import {
  IMetricsService as MetricsServiceInterface,
  METRICS_SERVICE,
} from '@modules/statistics/domain/interfaces/metrics-service.interface';
import { Controller, Get, Headers, HttpStatus, Inject, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { prometheusConf } from 'src/config';
import { Public } from 'src/decorators/public.decorator';

@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(
    @Inject(METRICS_SERVICE)
    private readonly metricsService: MetricsServiceInterface,
  ) {}

  @Public()
  @Get()
  async getMetrics(@Headers('authorization') authHeader: string, @Res() res: Response) {
    const prometheusUser = prometheusConf.user;
    const prometheusPassword = prometheusConf.password;
    const expectedAuth =
      'Basic ' + Buffer.from(`${prometheusUser}:${prometheusPassword}`).toString('base64');

    if (!authHeader || authHeader !== expectedAuth) {
      this.logger.error('Unauthorized access attempt to metrics endpoint');
      return res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
    }
    this.logger.debug('Getting metrics');
    res.setHeader('Content-Type', this.metricsService.getRegistry().contentType);
    return res.send(await this.metricsService.getRegistry().metrics());
  }
}

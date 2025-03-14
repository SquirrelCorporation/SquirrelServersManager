import { Controller, Get, Headers, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { Logger } from '@nestjs/common';
import { MetricsService } from '@modules/statistics/application/services/metrics.service';
import { prometheusConf } from 'src/config';

@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  async getMetrics(@Headers('authorization') authHeader: string, @Res() res: Response) {
    const prometheusUser = prometheusConf.user;
    const prometheusPassword = prometheusConf.password;
    const expectedAuth = 'Basic ' + Buffer.from(`${prometheusUser}:${prometheusPassword}`).toString('base64');

    if (!authHeader || authHeader !== expectedAuth) {
      this.logger.error('Unauthorized access attempt to metrics endpoint');
      return res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
    }
    this.logger.log('Getting metrics');
    res.setHeader('Content-Type', this.metricsService.getRegistry().contentType);
    return res.send(await this.metricsService.getRegistry().metrics());
  }
}
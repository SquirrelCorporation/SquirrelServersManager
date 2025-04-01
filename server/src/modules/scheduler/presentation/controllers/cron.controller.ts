import { Controller, Get } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronService } from '../../application/services/cron.service';

@Controller('admin/crons')
export class CronController {
  constructor(
    private readonly cronService: CronService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Get()
  async getCrons() {
    const crons = await this.cronService.findAll();
    const activeJobs = this.schedulerRegistry.getCronJobs().keys();
    const activeJobsArray = Array.from(activeJobs);

    // Add active status to crons
    const enrichedCrons =
      crons?.map((cron) => ({
        ...cron,
        active: activeJobsArray.includes(cron.name),
      })) || [];

    return enrichedCrons;
  }
}

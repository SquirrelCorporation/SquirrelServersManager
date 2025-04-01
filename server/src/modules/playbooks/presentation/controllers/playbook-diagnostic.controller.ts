import { NotFoundError } from '@middlewares/api/ApiError';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { IPlaybooksService, PLAYBOOKS_SERVICE } from '@modules/playbooks';
import { IUser } from '@modules/users';
import { Controller, Get, Inject, Logger, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';

@Controller('playbooks/diagnostic')
@UseGuards(JwtAuthGuard)
export class PlaybookDiagnosticController {
  private readonly logger = new Logger(PlaybookDiagnosticController.name);

  constructor(
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(PLAYBOOKS_SERVICE)
    private readonly playbookService: IPlaybooksService,
  ) {}

  @Get(':uuid')
  async checkDeviceConnection(@Param() params, @Req() req): Promise<{ taskId: string }> {
    const { uuid } = params;
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new NotFoundError('Device ID not found');
    }

    const playbook =
      await this.playbookService.findOneByUniqueQuickReference('checkDeviceBeforeAdd');
    if (!playbook) {
      throw new NotFoundError('Playbook not found');
    }
    this.logger.log(
      `Executing playbook ${playbook.name} for device ${device.uuid} for user ${req.user.uuid}`,
    );
    const execId = await this.playbookService.executePlaybook(playbook, req.user as IUser, [
      device.uuid,
    ]);
    return {
      taskId: execId,
    };
  }
}

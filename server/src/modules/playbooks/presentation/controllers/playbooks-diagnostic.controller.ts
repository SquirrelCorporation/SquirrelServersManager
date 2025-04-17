import { EntityNotFoundException } from '@infrastructure/exceptions/app-exceptions';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { IPlaybooksService, PLAYBOOKS_SERVICE } from '@modules/playbooks';
import { Controller, Get, Inject, Logger, Param } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CheckDeviceConnectionDoc,
  PLAYBOOK_DIAGNOSTIC_TAG,
} from '../decorators/playbook-diagnostic.decorators';

@ApiTags(PLAYBOOK_DIAGNOSTIC_TAG)
@Controller('playbooks/diagnostic')
export class PlaybooksDiagnosticController {
  private readonly logger = new Logger(PlaybooksDiagnosticController.name);

  constructor(
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(PLAYBOOKS_SERVICE)
    private readonly playbookService: IPlaybooksService,
  ) {}

  @CheckDeviceConnectionDoc()
  @Get(':uuid')
  async checkDeviceConnection(@Param() params, @User() user): Promise<{ taskId: string }> {
    const { uuid } = params;
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new EntityNotFoundException('Device', uuid);
    }

    const playbook =
      await this.playbookService.findOneByUniqueQuickReference('checkDeviceBeforeAdd');
    if (!playbook) {
      throw new EntityNotFoundException('Playbook', 'checkDeviceBeforeAdd');
    }
    this.logger.log(
      `Executing playbook ${playbook.name} for device ${device.uuid} for user ${user.uuid}`,
    );
    const execId = await this.playbookService.executePlaybook(playbook, user, [device.uuid]);
    return {
      taskId: execId,
    };
  }
}

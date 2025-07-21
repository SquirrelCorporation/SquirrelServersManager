import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IPlaybook } from '@modules/playbooks/domain/entities/playbook.entity';
import {
  IPlaybooksService,
  PLAYBOOKS_SERVICE,
} from '@modules/playbooks/domain/interfaces/playbooks-service.interface';
import { ExecutePlaybookPayloadDto } from '@modules/mcp/application/dto/execute-playbook.payload.dto';
import { PlaybookStatusPayloadDto } from '@modules/mcp/application/dto/playbook-status.payload.dto';

@Controller()
export class PlaybooksMicroserviceController {
  private readonly logger = new Logger(PlaybooksMicroserviceController.name);

  constructor(@Inject(PLAYBOOKS_SERVICE) private readonly playbookService: IPlaybooksService) {}

  // Note: Needs modification if PlaybookService.executePlaybook signature changes
  // Especially regarding how the User is obtained.
  @MessagePattern({ cmd: 'core_execute_playbook' })
  async executePlaybook(@Payload() payload: ExecutePlaybookPayloadDto): Promise<string> {
    // Define proper return type (e.g., execution ID or result)
    this.logger.log(
      `Handling core_execute_playbook via MessagePattern: ${JSON.stringify(payload)}`,
    );

    let playbook: IPlaybook | null = null;
    if (payload.playbookUuid) {
      playbook = await this.playbookService.getPlaybookByUuid(payload.playbookUuid);
    } else if (payload.playbookQuickRef) {
      playbook = await this.playbookService.getPlaybookByQuickReference(payload.playbookQuickRef);
    }

    if (!playbook) {
      throw new Error('Playbook not found via UUID or Quick Reference');
    }

    return this.playbookService.executePlaybook(playbook, payload.user, payload.target);
  }

  @MessagePattern({ cmd: 'core_get_playbook_status' })
  async getPlaybookStatus(@Payload() payload: PlaybookStatusPayloadDto): Promise<any> {
    // Define proper return type (e.g., status object)
    this.logger.log(
      `Handling core_get_playbook_status via MessagePattern for Exec ID: ${payload.execId}`,
    );
    if (!payload.execId) {
      throw new Error('Missing execId in request payload');
    }
    // Corrected method call
    return this.playbookService.getExecStatus(payload.execId);
  }

  // Add other relevant playbook message patterns here if needed
}

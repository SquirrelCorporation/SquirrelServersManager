import { Automations, SsmContainer } from 'ssm-shared-lib';
import { IAutomationRepository } from '../../../domain/repositories/automation.repository.interface';
import { IVolumeRepository } from '../../../../containers/domain/repositories/volume.repository.interface';
import { IVolumeService } from '../../../../containers/application/services/volume.service.interface';
import { AbstractActionComponent } from './abstract-action.component';

export class DockerVolumeActionComponent extends AbstractActionComponent {
  public readonly dockerVolumeAction: SsmContainer.VolumeActions;
  public readonly volumeUuids: string[];
  private containerVolumeRepo: IVolumeRepository;
  private containerVolumeUseCases: IVolumeService;

  constructor(
    automationUuid: string,
    automationName: string,
    dockerVolumeAction: SsmContainer.VolumeActions,
    volumeUuids: string[],
    automationRepository: IAutomationRepository,
    containerVolumeRepo: IVolumeRepository,
    containerVolumeUseCases: IVolumeService
  ) {
    super(automationUuid, automationName, Automations.Actions.DOCKER_VOLUME, automationRepository);
    if (!volumeUuids || !dockerVolumeAction) {
      throw new Error('Empty parameters');
    }
    this.volumeUuids = volumeUuids;
    this.dockerVolumeAction = dockerVolumeAction;
    this.containerVolumeRepo = containerVolumeRepo;
    this.containerVolumeUseCases = containerVolumeUseCases;
  }

  async executeAction(): Promise<void> {
    this.childLogger.info('Docker Volume Action Component - executeAction - started');
    let success = true;

    for (const volumeUuid of this.volumeUuids) {
      this.childLogger.info(`Docker Volume Action Component - executeAction for: ${volumeUuid}`);
      const volume = await this.containerVolumeRepo.findVolumeByUuid(volumeUuid);

      if (!volume) {
        this.childLogger.error(`Docker Volume Action - Volume not found for ${volumeUuid}`);
        success = false;
      } else {
        try {
          await this.containerVolumeUseCases.performVolumeAction(volume, this.dockerVolumeAction);
        } catch (error: any) {
          this.childLogger.error(error);
          success = false;
        }
      }
    }

    if (success) {
      await this.onSuccess();
    } else {
      await this.onError('Failed to execute docker volume action on one or more volumes');
    }
  }
}

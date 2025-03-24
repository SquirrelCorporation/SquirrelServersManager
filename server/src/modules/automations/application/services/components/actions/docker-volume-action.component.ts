import { Automations, SsmContainer } from 'ssm-shared-lib';
import { IContainerVolumesService } from '@modules/containers';
import { IAutomationRepository } from '../../../../domain/repositories/automation.repository.interface';
import { AbstractActionComponent } from './abstract-action.component';

export class DockerVolumeActionComponent extends AbstractActionComponent {
  public readonly dockerVolumeAction: SsmContainer.VolumeActions;
  public readonly volumeUuids: string[];
  private containerVolumeUseCases: IContainerVolumesService;

  constructor(
    automationUuid: string,
    automationName: string,
    dockerVolumeAction: SsmContainer.VolumeActions,
    volumeUuids: string[],
    automationRepository: IAutomationRepository,
    containerVolumeUseCases: IContainerVolumesService,
  ) {
    super(automationUuid, automationName, Automations.Actions.DOCKER_VOLUME, automationRepository);
    if (!volumeUuids || !dockerVolumeAction) {
      throw new Error('Empty parameters');
    }
    this.volumeUuids = volumeUuids;
    this.dockerVolumeAction = dockerVolumeAction;
    this.containerVolumeUseCases = containerVolumeUseCases;
  }

  async executeAction(): Promise<void> {
    this.childLogger.info('Docker Volume Action Component - executeAction - started');
    let success = true;

    for (const volumeUuid of this.volumeUuids) {
      this.childLogger.info(`Docker Volume Action Component - executeAction for: ${volumeUuid}`);
      const volume = await this.containerVolumeUseCases.getVolumeByUuid(volumeUuid);

      if (!volume) {
        this.childLogger.error(`Docker Volume Action - Volume not found for ${volumeUuid}`);
        success = false;
      } else {
        try {
          switch (this.dockerVolumeAction) {
            case SsmContainer.VolumeActions.BACKUP:
              await this.containerVolumeUseCases.backupVolume(volume, this.dockerVolumeAction);
              break;
          }
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

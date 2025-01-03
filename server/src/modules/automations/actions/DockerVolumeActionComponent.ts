import { Automations, SsmContainer } from 'ssm-shared-lib';
import ContainerVolumeRepo from '../../../data/database/repository/ContainerVolumeRepo';
import ContainerVolumeUseCases from '../../../services/ContainerVolumeUseCases';
import AbstractActionComponent from './AbstractActionComponent';

class DockerVolumeActionComponent extends AbstractActionComponent {
  public readonly dockerVolumeAction: SsmContainer.VolumeActions;
  public readonly volumeUuids: string[];

  constructor(
    automationUuid: string,
    automationName: string,
    dockerVolumeAction: SsmContainer.VolumeActions,
    volumeUuids: string[],
  ) {
    super(automationUuid, automationName, Automations.Actions.DOCKER_VOLUME);
    if (!volumeUuids || !dockerVolumeAction) {
      throw new Error('Empty parameters');
    }
    this.volumeUuids = volumeUuids;
    this.dockerVolumeAction = dockerVolumeAction;
  }

  async executeAction() {
    this.childLogger.info(
      `Docker Volume Action - executeAction (${this.dockerVolumeAction}) - started...`,
    );
    let success = true;
    for (const volumeUuid of this.volumeUuids) {
      this.childLogger.info(`Docker Volume Action - executeAction - for volume: ${volumeUuid}`);
      const volume = await ContainerVolumeRepo.findByUuid(volumeUuid);
      if (!volume) {
        this.childLogger.error(
          `Volume not found. (Volume uuid: ${volumeUuid}, Action: ${this.dockerVolumeAction})`,
        );
        success = false;
      } else {
        try {
          switch (this.dockerVolumeAction) {
            case SsmContainer.VolumeActions.BACKUP:
              await ContainerVolumeUseCases.backupVolume(
                volume,
                SsmContainer.VolumeBackupMode.FILE_SYSTEM,
              );
          }
        } catch (error: any) {
          this.childLogger.error(error);
          success = false;
        }
      }
    }
    this.childLogger.info(
      `Docker Volume Action - executeAction - ${this.dockerVolumeAction} ended with ${success ? 'success' : 'failure'}`,
    );
    if (success) {
      await this.onSuccess();
    } else {
      await this.onError();
    }
  }
}

export default DockerVolumeActionComponent;

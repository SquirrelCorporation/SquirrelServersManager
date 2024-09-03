import { Automations, SsmContainer } from 'ssm-shared-lib';
import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import ContainerUseCases from '../../../services/ContainerUseCases';
import AbstractActionComponent from './AbstractActionComponent';

class DockerActionComponent extends AbstractActionComponent {
  public readonly dockerAction: SsmContainer.Actions;
  public readonly containerIds: string[];

  constructor(
    automationUuid: string,
    automationName: string,
    dockerAction: SsmContainer.Actions,
    containerIds: string[],
  ) {
    super(automationUuid, automationName, Automations.Actions.DOCKER);
    if (!containerIds || !dockerAction) {
      throw new Error('Empty parameters');
    }
    this.containerIds = containerIds;
    this.dockerAction = dockerAction;
  }

  async executeAction() {
    this.childLogger.info('Docker Action Component execute - started');
    let success = true;
    for (const containerId of this.containerIds) {
      this.childLogger.info(`Docker Action Component execute - ${containerId}`);
      const container = await ContainerRepo.findContainerById(containerId);
      if (!container) {
        this.childLogger.error(`Container not found for ${containerId}`);
        success = false;
      } else {
        try {
          await ContainerUseCases.performAction(container, this.dockerAction);
        } catch (error: any) {
          this.childLogger.error(error);
          success = false;
        }
      }
    }
    this.childLogger.info('Docker Action Component execute - ended');
    if (success) {
      await this.onSuccess();
    } else {
      await this.onError();
    }
  }
}

export default DockerActionComponent;

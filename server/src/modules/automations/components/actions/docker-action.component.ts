import { Automations, SsmContainer } from 'ssm-shared-lib';
import ContainerRepo from '../../../../data/database/repository/ContainerRepo';
import ContainerUseCases from '../../../../services/ContainerUseCases';
import { AbstractActionComponent } from './abstract-action.component';

export class DockerActionComponent extends AbstractActionComponent {
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

  async executeAction(): Promise<void> {
    this.childLogger.info('Docker Action Component - executeAction - started');
    let success = true;

    for (const containerId of this.containerIds) {
      this.childLogger.info(`Docker Action Component - executeAction for: ${containerId}`);
      const container = await ContainerRepo.findContainerById(containerId);

      if (!container) {
        this.childLogger.error(`Docker Action - Container not found for ${containerId}`);
        success = false;
      } else {
        try {
          await ContainerUseCases.performDockerAction(container, this.dockerAction);
        } catch (error: any) {
          this.childLogger.error(error);
          success = false;
        }
      }
    }

    this.childLogger.info(
      `Docker Action Component - executeAction - ended with ${success ? 'success' : 'failure'}`,
    );

    if (success) {
      await this.onSuccess();
    } else {
      await this.onError('Failed to perform docker action on one or more containers');
    }
  }
}

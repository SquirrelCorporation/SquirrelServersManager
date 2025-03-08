import { Automations, SsmContainer } from 'ssm-shared-lib';
import { IAutomationRepository } from '../../../domain/repositories/automation.repository.interface';
import { IContainerRepository } from '../../../../containers/domain/repositories/container.repository.interface';
import { IContainerService } from '../../../../containers/application/services/container.service.interface';
import { AbstractActionComponent } from './abstract-action.component';

export class DockerActionComponent extends AbstractActionComponent {
  public readonly dockerAction: SsmContainer.Actions;
  public readonly containerIds: string[];
  private containerRepo: IContainerRepository;
  private containerUseCases: IContainerService;

  constructor(
    automationUuid: string,
    automationName: string,
    dockerAction: SsmContainer.Actions,
    containerIds: string[],
    automationRepository: IAutomationRepository,
    containerRepo: IContainerRepository,
    containerUseCases: IContainerService
  ) {
    super(automationUuid, automationName, Automations.Actions.DOCKER, automationRepository);
    if (!containerIds || !dockerAction) {
      throw new Error('Empty parameters');
    }
    this.containerIds = containerIds;
    this.dockerAction = dockerAction;
    this.containerRepo = containerRepo;
    this.containerUseCases = containerUseCases;
  }

  async executeAction(): Promise<void> {
    this.childLogger.info('Docker Action Component - executeAction - started');
    let success = true;

    for (const containerId of this.containerIds) {
      this.childLogger.info(`Docker Action Component - executeAction for: ${containerId}`);
      const container = await this.containerRepo.findContainerById(containerId);

      if (!container) {
        this.childLogger.error(`Docker Action - Container not found for ${containerId}`);
        success = false;
      } else {
        try {
          await this.containerUseCases.performDockerAction(container, this.dockerAction);
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
      await this.onError('Failed to execute docker action on one or more containers');
    }
  }
}

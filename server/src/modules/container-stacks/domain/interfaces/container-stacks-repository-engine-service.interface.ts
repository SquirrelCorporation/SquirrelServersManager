import { ContainerRepositoryComponentService } from '@modules/container-stacks/application/services/container-repository-component.service';
import { IContainerCustomStackRepositoryEntity } from '@modules/container-stacks/domain/entities/container-custom-stack.entity';

export const CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE =
  'CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE';

export interface IContainerCustomStacksRepositoryEngineService {
  registerRepository(
    repository: IContainerCustomStackRepositoryEntity,
  ): Promise<ContainerRepositoryComponentService>;
}

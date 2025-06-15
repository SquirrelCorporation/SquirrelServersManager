import { IContainerCustomStackRepository } from '../entities/container-custom-stack.entity';

export const CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY =
  'CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY';

/**
 * Repository interface for container custom stack repositories
 */
export interface IContainerCustomStackRepositoryRepository {
  findAll(): Promise<IContainerCustomStackRepository[]>;
  findByUuid(uuid: string): Promise<IContainerCustomStackRepository | null>;
  create(repository: IContainerCustomStackRepository): Promise<IContainerCustomStackRepository>;
  update(
    uuid: string,
    repository: Partial<IContainerCustomStackRepository>,
  ): Promise<IContainerCustomStackRepository>;
  deleteByUuid(uuid: string): Promise<boolean>;
}

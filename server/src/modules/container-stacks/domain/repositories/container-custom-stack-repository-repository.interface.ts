import { IContainerCustomStackRepositoryEntity } from '../entities/container-custom-stack.entity';

export const CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY = 'CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY';

export interface IContainerCustomStackRepositoryRepository {
  findAll(): Promise<IContainerCustomStackRepositoryEntity[]>;
  findByUuid(uuid: string): Promise<IContainerCustomStackRepositoryEntity | null>;
  create(repository: IContainerCustomStackRepositoryEntity): Promise<IContainerCustomStackRepositoryEntity>;
  update(uuid: string, repository: Partial<IContainerCustomStackRepositoryEntity>): Promise<IContainerCustomStackRepositoryEntity>;
  deleteByUuid(uuid: string): Promise<boolean>;
}
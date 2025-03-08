import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';

export const CONTAINER_STACKS_SERVICE = 'CONTAINER_STACKS_SERVICE';

export interface IContainerStacksService {
  getAllStacks(): Promise<ContainerCustomStack[]>;
  getStackByUuid(uuid: string): Promise<ContainerCustomStack | null>;
  createStack(stack: ContainerCustomStack): Promise<ContainerCustomStack>;
  updateStack(uuid: string, stack: Partial<ContainerCustomStack>): Promise<ContainerCustomStack>;
  deleteStackByUuid(uuid: string): Promise<boolean>;

  getAllRepositories(): Promise<IContainerCustomStackRepositoryEntity[]>;
  getRepositoryByUuid(uuid: string): Promise<IContainerCustomStackRepositoryEntity | null>;
  createRepository(repository: IContainerCustomStackRepositoryEntity): Promise<IContainerCustomStackRepositoryEntity>;
  updateRepository(uuid: string, repository: Partial<IContainerCustomStackRepositoryEntity>): Promise<IContainerCustomStackRepositoryEntity>;
  deleteRepositoryByUuid(uuid: string): Promise<boolean>;
}
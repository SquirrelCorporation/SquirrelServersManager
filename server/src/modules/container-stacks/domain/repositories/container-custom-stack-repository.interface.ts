import {
  ContainerCustomStack,
  IContainerCustomStackRepositoryEntity,
} from '../entities/container-custom-stack.entity';

export const CONTAINER_CUSTOM_STACK_REPOSITORY = 'CONTAINER_CUSTOM_STACK_REPOSITORY';

export interface IContainerCustomStackRepository {
  findAll(): Promise<ContainerCustomStack[]>;
  findByUuid(uuid: string): Promise<ContainerCustomStack | null>;
  create(stack: ContainerCustomStack): Promise<ContainerCustomStack>;
  update(uuid: string, stack: Partial<ContainerCustomStack>): Promise<ContainerCustomStack>;
  deleteByUuid(uuid: string): Promise<boolean>;
  listAllByRepository(
    repository: IContainerCustomStackRepositoryEntity,
  ): Promise<ContainerCustomStack[]>;
}

import { IUser } from '@modules/users';
import { OnModuleInit } from '@nestjs/common';
import {
  ContainerCustomStack,
  IContainerCustomStackRepositoryEntity,
} from '../../domain/entities/container-custom-stack.entity';

export const CONTAINER_STACKS_SERVICE = 'CONTAINER_STACKS_SERVICE';

export interface IContainerStacksService extends OnModuleInit {
  getAllStacks(): Promise<ContainerCustomStack[]>;
  getStackByUuid(uuid: string): Promise<ContainerCustomStack | null>;
  createStack(stack: ContainerCustomStack): Promise<ContainerCustomStack>;
  updateStack(uuid: string, stack: Partial<ContainerCustomStack>): Promise<ContainerCustomStack>;
  deleteStackByUuid(uuid: string): Promise<boolean>;

  getAllRepositories(): Promise<IContainerCustomStackRepositoryEntity[]>;
  getRepositoryByUuid(uuid: string): Promise<IContainerCustomStackRepositoryEntity | null>;
  createRepository(
    repository: IContainerCustomStackRepositoryEntity,
  ): Promise<IContainerCustomStackRepositoryEntity>;
  updateRepository(
    uuid: string,
    repository: Partial<IContainerCustomStackRepositoryEntity>,
  ): Promise<IContainerCustomStackRepositoryEntity>;
  deleteRepositoryByUuid(uuid: string): Promise<boolean>;
  transformStack(content: any): Promise<{ yaml: string }>;
  dryRunStack(json: any, yaml: string): Promise<{ validating: boolean; message?: string }>;
  deployStack(uuid: string, target: string, user: IUser): Promise<{ execId: string }>;
  forcePullRepository(uuid: string): Promise<void>;
  forceCloneRepository(uuid: string): Promise<void>;
  forceRegisterRepository(uuid: string): Promise<void>;
  commitAndSyncRepository(uuid: string): Promise<void>;
  syncToDatabaseRepository(uuid: string): Promise<void>;
}

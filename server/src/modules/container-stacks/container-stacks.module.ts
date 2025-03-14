import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnsibleVaultModule } from '@modules/ansible-vault';
import { ShellModule } from '../shell/shell.module';
import { ContainerStacksController } from './presentation/controllers/container-stacks.controller';
import { ContainerStacksService } from './application/services/container-stacks.service';
import { ContainerCustomStacksRepositoryEngineService } from './application/services/container-stacks-repository-engine-service';
import { ContainerRepositoryComponentService } from './application/services/container-repository-component.service';
import { ContainerCustomStackRepository } from './infrastructure/repositories/container-custom-stack.repository';
import { ContainerCustomStacksRepositoryRepository } from './infrastructure/repositories/container-custom-stacks-repository.repository';
import { CONTAINER_CUSTOM_STACK, ContainerCustomStackSchema } from './infrastructure/schemas/container-custom-stack.schema';
import { CONTAINER_CUSTOM_STACK_REPOSITORY, ContainerCustomStackRepositorySchema } from './infrastructure/schemas/container-custom-stack-repository.schema';
import { CONTAINER_STACKS_SERVICE } from './application/interfaces/container-stacks-service.interface';
import { CONTAINER_CUSTOM_STACK_REPOSITORY as CONTAINER_CUSTOM_STACK_REPOSITORY_TOKEN } from './domain/repositories/container-custom-stack-repository.interface';
import { CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY } from './domain/repositories/container-custom-stack-repository-repository.interface';
import { CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE } from './application/interfaces/container-stacks-repository-engine-service.interface';
import { CONTAINER_REPOSITORY_COMPONENT_SERVICE } from './application/interfaces/container-repository-component-service.interface';
import { ContainerCustomStackMapper } from './infrastructure/mappers/container-custom-stack.mapper';
import { ContainerCustomStackRepositoryMapper } from './infrastructure/mappers/container-custom-stack-repository.mapper';

/**
 * ContainerStacksModule provides services for managing container stacks and repositories
 */
@Module({
  imports: [
    ShellModule,
    AnsibleVaultModule,
    MongooseModule.forFeature([
      { name: CONTAINER_CUSTOM_STACK, schema: ContainerCustomStackSchema },
      { name: CONTAINER_CUSTOM_STACK_REPOSITORY, schema: ContainerCustomStackRepositorySchema },
    ]),
  ],
  controllers: [
    ContainerStacksController,
  ],
  providers: [
    {
      provide: CONTAINER_STACKS_SERVICE,
      useClass: ContainerStacksService,
    },
    {
      provide: CONTAINER_CUSTOM_STACK_REPOSITORY_TOKEN,
      useClass: ContainerCustomStackRepository,
    },
    {
      provide: CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY,
      useClass: ContainerCustomStacksRepositoryRepository,
    },
    {
      provide: CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE,
      useClass: ContainerCustomStacksRepositoryEngineService,
    },
    {
      provide: CONTAINER_REPOSITORY_COMPONENT_SERVICE,
      useClass: ContainerRepositoryComponentService,
    },
    ContainerStacksService,
    ContainerCustomStackRepository,
    ContainerCustomStacksRepositoryRepository,
    ContainerCustomStacksRepositoryEngineService,
    ContainerRepositoryComponentService,
    ContainerCustomStackMapper,
    ContainerCustomStackRepositoryMapper,
  ],
  exports: [
    CONTAINER_STACKS_SERVICE,
    ContainerStacksService,
    CONTAINER_CUSTOM_STACK_REPOSITORY_TOKEN,
    CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY,
    CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE,
    CONTAINER_REPOSITORY_COMPONENT_SERVICE,
  ],
})
export class ContainerStacksModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShellModule } from '../shell/shell.module';
import { ContainerStacksController } from './controllers/container-stacks.controller';
import { ContainerStacksService } from './services/container-stacks.service';
import { CONTAINER_CUSTOM_STACK, ContainerCustomStackSchema } from './schemas/container-custom-stack.schema';
import { CONTAINER_CUSTOM_STACK_REPOSITORY, ContainerCustomStackRepositorySchema } from './schemas/container-custom-stack-repository.schema';
import { ContainerCustomStackRepository } from './repositories/container-custom-stack.repository';
import { ContainerCustomStacksRepositoryRepository } from './repositories/container-custom-stacks-repository.repository';
import { ContainerCustomStacksRepositoryEngineService } from './services/container-stacks-repository-engine-service';
import { ContainerRepositoryComponentService } from './services/container-stacks-repository-component.service';

/**
 * ContainerStacksModule provides services for managing container stacks and repositories
 */
@Module({
  imports: [
    ShellModule,
    MongooseModule.forFeature([
      { name: CONTAINER_CUSTOM_STACK, schema: ContainerCustomStackSchema },
      { name: CONTAINER_CUSTOM_STACK_REPOSITORY, schema: ContainerCustomStackRepositorySchema },
    ]),
  ],
  controllers: [ContainerStacksController],
  providers: [
    ContainerStacksService,
    ContainerCustomStackRepository,
    ContainerCustomStacksRepositoryRepository,
    ContainerCustomStacksRepositoryEngineService,
    ContainerRepositoryComponentService,
  ],
  exports: [
    ContainerStacksService,
    ContainerCustomStackRepository,
    ContainerCustomStacksRepositoryRepository,
    ContainerCustomStacksRepositoryEngineService,
    ContainerRepositoryComponentService,
  ],
})
export class ContainerStacksModule {}
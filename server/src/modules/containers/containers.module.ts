import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LscrRegistryComponent } from '@modules/containers/application/services/components/registry/lscr-registry.component';
import { ContainerDiagnosticController } from '@modules/containers/presentation/controllers/container-diagnostic.controller';
import { ShellModule } from '../shell/shell.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { DevicesModule } from '../devices/devices.module';
import { CONTAINER_SCHEMA, ContainerSchema } from './infrastructure/schemas/container.schema';
import {
  CONTAINER_VOLUME,
  ContainerVolumeSchema,
} from './infrastructure/schemas/container-volume.schema';
import {
  CONTAINER_NETWORK_SCHEMA,
  ContainerNetworkSchema,
} from './infrastructure/schemas/container-network.schema';
import {
  CONTAINER_IMAGE,
  ContainerImageSchema,
} from './infrastructure/schemas/container-image.schema';
import {
  CONTAINER_REGISTRY_SCHEMA,
  ContainerRegistrySchema,
} from './infrastructure/schemas/container-registry.schema';
import { ContainerRepository } from './infrastructure/repositories/container.repository';
import { ContainerVolumeRepository } from './infrastructure/repositories/container-volume.repository';
import { ContainerNetworkRepository } from './infrastructure/repositories/container-network.repository';
import { ContainerImageRepository } from './infrastructure/repositories/container-image.repository';
import { ContainerRegistryRepository } from './infrastructure/repositories/container-registry.repository';
import { ContainerService } from './application/services/container.service';
import { ContainerVolumesService } from './application/services/container-volumes.service';
import { ContainerNetworksService } from './application/services/container-networks.service';
import { ContainerImagesService } from './application/services/container-images.service';
import { ContainerLogsService } from './application/services/container-logs.service';
import { ContainerStatsService } from './application/services/container-stats.service';
import { ContainerRegistriesService } from './application/services/container-registries.service';
import { ContainerTemplatesService } from './application/services/container-templates.service';
import { RegistryComponentFactory } from './application/services/components/registry/registry-component-factory.service';
import { DockerHubRegistryComponent } from './application/services/components/registry/docker-hub-registry.component';
import { CustomRegistryComponent } from './application/services/components/registry/custom-registry.component';
import { GcrRegistryComponent } from './application/services/components/registry/gcr-registry.component';
import { GhcrRegistryComponent } from './application/services/components/registry/ghcr-registry.component';
import { AcrRegistryComponent } from './application/services/components/registry/acr-registry.component';
import { EcrRegistryComponent } from './application/services/components/registry/ecr-registry.component';
import { QuayRegistryComponent } from './application/services/components/registry/quay-registry.component';
import { GitLabRegistryComponent } from './application/services/components/registry/gitlab-registry.component';
import { GiteaRegistryComponent } from './application/services/components/registry/gitea-registry.component';
import { ForgejoRegistryComponent } from './application/services/components/registry/forgejo-registry.component';
import { CONTAINER_REPOSITORY } from './domain/repositories/container-repository.interface';
import { CONTAINER_VOLUME_REPOSITORY } from './domain/repositories/container-volume-repository.interface';
import { CONTAINER_NETWORK_REPOSITORY } from './domain/repositories/container-network-repository.interface';
import { CONTAINER_IMAGE_REPOSITORY } from './domain/repositories/container-image-repository.interface';
import { CONTAINER_REGISTRY_REPOSITORY } from './domain/repositories/container-registry-repository.interface';
import { CONTAINER_SERVICE } from './applicati../../domain/interfaces/container-service.interface';
import { CONTAINER_VOLUMES_SERVICE } from './applicati../../domain/interfaces/container-volumes-service.interface';
import { CONTAINER_NETWORKS_SERVICE } from './applicati../../domain/interfaces/container-networks-service.interface';
import { CONTAINER_IMAGES_SERVICE } from './applicati../../domain/interfaces/container-images-service.interface';
import { CONTAINER_LOGS_SERVICE } from './applicati../../domain/interfaces/container-logs-service.interface';
import { CONTAINER_STATS_SERVICE } from './applicati../../domain/interfaces/container-stats-service.interface';
import { CONTAINER_REGISTRIES_SERVICE } from './applicati../../domain/interfaces/container-registries-service.interface';
import { CONTAINER_TEMPLATES_SERVICE } from './applicati../../domain/interfaces/container-templates-service.interface';
import { ContainerMapper } from './infrastructure/mappers/container.mapper';
import { ContainerNetworkMapper } from './infrastructure/mappers/container-network.mapper';
import { ContainersController } from './presentation/controllers/containers.controller';
import { ContainerVolumesController } from './presentation/controllers/container-volumes.controller';
import { ContainerNetworksController } from './presentation/controllers/container-networks.controller';
import { ContainerImagesController } from './presentation/controllers/container-images.controller';
import { ContainerStatsController } from './presentation/controllers/container-stats.controller';
import { ContainerRegistriesController } from './presentation/controllers/container-registries.controller';
import { ContainerTemplatesController } from './presentation/controllers/container-templates.controller';
import { ContainerLogsGateway } from './presentation/gateways/container-logs.gateway';
import { WatcherEngineService } from './application/services/engine/watcher-engine.service';
import { WATCHER_ENGINE_SERVICE } from './applicati../../domain/interfaces/watcher-engine-service.interface';
import { WatcherComponentFactory } from './application/services/components/watcher/watcher-component-factory.service';
import { DockerWatcherComponent } from './application/services/components/watcher/providers/docker/docker-watcher.component';

/**
 * ContainersModule provides services for managing Docker containers, volumes, networks, images, and registries
 * following Clean Architecture principles
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CONTAINER_SCHEMA, schema: ContainerSchema },
      { name: CONTAINER_VOLUME, schema: ContainerVolumeSchema },
      { name: CONTAINER_NETWORK_SCHEMA, schema: ContainerNetworkSchema },
      { name: CONTAINER_IMAGE, schema: ContainerImageSchema },
      { name: CONTAINER_REGISTRY_SCHEMA, schema: ContainerRegistrySchema },
    ]),
    ScheduleModule.forRoot(),
    ShellModule,
    PlaybooksModule,
    forwardRef(() => StatisticsModule),
    DevicesModule,
  ],
  controllers: [
    ContainersController,
    ContainerVolumesController,
    ContainerNetworksController,
    ContainerImagesController,
    ContainerStatsController,
    ContainerRegistriesController,
    ContainerTemplatesController,
    ContainerDiagnosticController,
  ],
  providers: [
    // Mappers
    ContainerMapper,
    ContainerNetworkMapper,

    // Repositories
    {
      provide: CONTAINER_REPOSITORY,
      useClass: ContainerRepository,
    },
    {
      provide: CONTAINER_VOLUME_REPOSITORY,
      useClass: ContainerVolumeRepository,
    },
    {
      provide: CONTAINER_NETWORK_REPOSITORY,
      useClass: ContainerNetworkRepository,
    },
    {
      provide: CONTAINER_IMAGE_REPOSITORY,
      useClass: ContainerImageRepository,
    },
    {
      provide: CONTAINER_REGISTRY_REPOSITORY,
      useClass: ContainerRegistryRepository,
    },

    // Services
    {
      provide: WATCHER_ENGINE_SERVICE,
      useClass: WatcherEngineService,
    },
    {
      provide: CONTAINER_SERVICE,
      useClass: ContainerService,
    },
    {
      provide: CONTAINER_VOLUMES_SERVICE,
      useClass: ContainerVolumesService,
    },
    {
      provide: CONTAINER_NETWORKS_SERVICE,
      useClass: ContainerNetworksService,
    },
    {
      provide: CONTAINER_IMAGES_SERVICE,
      useClass: ContainerImagesService,
    },
    {
      provide: CONTAINER_LOGS_SERVICE,
      useClass: ContainerLogsService,
    },
    {
      provide: CONTAINER_STATS_SERVICE,
      useClass: ContainerStatsService,
    },
    {
      provide: CONTAINER_REGISTRIES_SERVICE,
      useClass: ContainerRegistriesService,
    },
    {
      provide: CONTAINER_TEMPLATES_SERVICE,
      useClass: ContainerTemplatesService,
    },

    RegistryComponentFactory,
    WatcherComponentFactory,
    // Registry components
    DockerHubRegistryComponent,
    CustomRegistryComponent,
    GcrRegistryComponent,
    GhcrRegistryComponent,
    AcrRegistryComponent,
    EcrRegistryComponent,
    QuayRegistryComponent,
    GitLabRegistryComponent,
    GiteaRegistryComponent,
    ForgejoRegistryComponent,
    LscrRegistryComponent,

    // Watcher components
    DockerWatcherComponent,

    // Gateways
    ContainerLogsGateway,
  ],
  exports: [
    // Services
    {
      provide: WATCHER_ENGINE_SERVICE,
      useClass: WatcherEngineService,
    },
    {
      provide: CONTAINER_SERVICE,
      useClass: ContainerService,
    },
    {
      provide: CONTAINER_VOLUMES_SERVICE,
      useClass: ContainerVolumesService,
    },
    {
      provide: CONTAINER_NETWORKS_SERVICE,
      useClass: ContainerNetworksService,
    },
    {
      provide: CONTAINER_IMAGES_SERVICE,
      useClass: ContainerImagesService,
    },
    {
      provide: CONTAINER_LOGS_SERVICE,
      useClass: ContainerLogsService,
    },
    {
      provide: CONTAINER_STATS_SERVICE,
      useClass: ContainerStatsService,
    },
    {
      provide: CONTAINER_REGISTRIES_SERVICE,
      useClass: ContainerRegistriesService,
    },
    {
      provide: CONTAINER_TEMPLATES_SERVICE,
      useClass: ContainerTemplatesService,
    },
    // Export only modules and services, not repositories
    ScheduleModule,
  ],
})
export class ContainersModule {}

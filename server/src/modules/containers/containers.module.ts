import { LscrRegistryComponent } from '@modules/containers/application/services/components/registry/lscr-registry.component';
import { ContainerDiagnosticController } from '@modules/containers/presentation/controllers/container-diagnostic.controller';
import { ContainersGateway } from '@modules/containers/presentation/gateways/container-volumes.gateway';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { WsAuthModule } from '@infrastructure/websocket-auth/ws-auth.module';
import { AnsibleVaultsModule } from '@modules/ansible-vaults';
import { DevicesModule } from '../devices/devices.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { ShellModule } from '../shell/shell.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { AcrRegistryComponent } from './application/services/components/registry/acr-registry.component';
import { CustomRegistryComponent } from './application/services/components/registry/custom-registry.component';
import { DockerHubRegistryComponent } from './application/services/components/registry/docker-hub-registry.component';
import { EcrRegistryComponent } from './application/services/components/registry/ecr-registry.component';
import { ForgejoRegistryComponent } from './application/services/components/registry/forgejo-registry.component';
import { GcrRegistryComponent } from './application/services/components/registry/gcr-registry.component';
import { GhcrRegistryComponent } from './application/services/components/registry/ghcr-registry.component';
import { GiteaRegistryComponent } from './application/services/components/registry/gitea-registry.component';
import { GitLabRegistryComponent } from './application/services/components/registry/gitlab-registry.component';
import { QuayRegistryComponent } from './application/services/components/registry/quay-registry.component';
import { RegistryComponentFactory } from './application/services/components/registry/registry-component-factory.service';
import { DockerWatcherComponent } from './application/services/components/watcher/providers/docker/docker-watcher.component';
import { WatcherComponentFactory } from './application/services/components/watcher/watcher-component-factory.service';
import { ContainerImagesService } from './application/services/container-images.service';
import { ContainerLogsService } from './application/services/container-logs.service';
import { ContainerNetworksService } from './application/services/container-networks.service';
import { ContainerRegistriesService } from './application/services/container-registries.service';
import { ContainerStatsService } from './application/services/container-stats.service';
import { ContainerTemplatesService } from './application/services/container-templates.service';
import { ContainerVolumesService } from './application/services/container-volumes.service';
import { ContainerService } from './application/services/container.service';
import { WatcherEngineService } from './application/services/engine/watcher-engine.service';
import { CONTAINER_IMAGES_SERVICE } from './domain/interfaces/container-images-service.interface';
import { CONTAINER_LOGS_SERVICE } from './domain/interfaces/container-logs-service.interface';
import { CONTAINER_NETWORKS_SERVICE } from './domain/interfaces/container-networks-service.interface';
import { CONTAINER_REGISTRIES_SERVICE } from './domain/interfaces/container-registries-service.interface';
import { CONTAINER_SERVICE } from './domain/interfaces/container-service.interface';
import { CONTAINER_STATS_SERVICE } from './domain/interfaces/container-stats-service.interface';
import { CONTAINER_TEMPLATES_SERVICE } from './domain/interfaces/container-templates-service.interface';
import { CONTAINER_VOLUMES_SERVICE } from './domain/interfaces/container-volumes-service.interface';
import { WATCHER_ENGINE_SERVICE } from './domain/interfaces/watcher-engine-service.interface';
import { CONTAINER_IMAGE_REPOSITORY } from './domain/repositories/container-image-repository.interface';
import { CONTAINER_NETWORK_REPOSITORY } from './domain/repositories/container-network-repository.interface';
import { CONTAINER_REGISTRY_REPOSITORY } from './domain/repositories/container-registry-repository.interface';
import { CONTAINER_REPOSITORY } from './domain/repositories/container-repository.interface';
import { CONTAINER_VOLUME_REPOSITORY } from './domain/repositories/container-volume-repository.interface';
import { ContainerNetworkMapper } from './infrastructure/mappers/container-network.mapper';
import { ContainerMapper } from './infrastructure/mappers/container.mapper';
import { ContainerImageRepository } from './infrastructure/repositories/container-image.repository';
import { ContainerNetworkRepository } from './infrastructure/repositories/container-network.repository';
import { ContainerRegistryRepository } from './infrastructure/repositories/container-registry.repository';
import { ContainerVolumeRepository } from './infrastructure/repositories/container-volume.repository';
import { ContainerRepository } from './infrastructure/repositories/container.repository';
import {
  CONTAINER_IMAGE,
  ContainerImageSchema,
} from './infrastructure/schemas/container-image.schema';
import {
  CONTAINER_NETWORK_SCHEMA,
  ContainerNetworkSchema,
} from './infrastructure/schemas/container-network.schema';
import {
  CONTAINER_REGISTRY_SCHEMA,
  ContainerRegistrySchema,
} from './infrastructure/schemas/container-registry.schema';
import {
  CONTAINER_VOLUME,
  ContainerVolumeSchema,
} from './infrastructure/schemas/container-volume.schema';
import { CONTAINER_SCHEMA, ContainerSchema } from './infrastructure/schemas/container.schema';
import {
  PROXMOX_CONTAINER_MODEL_TOKEN,
  ProxmoxContainerSchema,
} from './infrastructure/schemas/proxmox-container.schema';
import { ContainerImagesController } from './presentation/controllers/container-images.controller';
import { ContainerNetworksController } from './presentation/controllers/container-networks.controller';
import { ContainerRegistriesController } from './presentation/controllers/container-registries.controller';
import { ContainerStatsController } from './presentation/controllers/container-stats.controller';
import { ContainerTemplatesController } from './presentation/controllers/container-templates.controller';
import { ContainerVolumesController } from './presentation/controllers/container-volumes.controller';
import { ContainersController } from './presentation/controllers/containers.controller';
import { ContainerLogsGateway } from './presentation/gateways/container-logs.gateway';
import { PROXMOX_CONTAINER_REPOSITORY } from './domain/repositories/proxmox-container.repository.interface';
import { ProxmoxContainerRepository } from './infrastructure/repositories/proxmox-container.repository';
import { ContainersMicroserviceController } from './presentation/controllers/containers-microservice.controller';
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
      { name: PROXMOX_CONTAINER_MODEL_TOKEN, schema: ProxmoxContainerSchema },
    ]),
    ScheduleModule.forRoot(),
    ShellModule,
    PlaybooksModule,
    forwardRef(() => StatisticsModule),
    DevicesModule,
    WsAuthModule,
    AnsibleVaultsModule,
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
    ContainersMicroserviceController,
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
    {
      provide: PROXMOX_CONTAINER_REPOSITORY,
      useClass: ProxmoxContainerRepository,
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
    ContainersGateway,
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
    {
      provide: PROXMOX_CONTAINER_REPOSITORY,
      useClass: ProxmoxContainerRepository,
    },
    // Export only modules and services, not repositories
    ScheduleModule,
  ],
})
export class ContainersModule {}

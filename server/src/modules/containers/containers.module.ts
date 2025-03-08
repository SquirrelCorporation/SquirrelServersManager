import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShellModule } from '../shell/shell.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { DevicesModule } from '../devices/devices.module';
import { ContainerRegistriesService } from './services/container-registries.service';
import { ContainersService } from './services/containers.service';
import { ContainerVolumesService } from './services/container-volumes.service';
import { ContainerStatsService } from './services/container-stats.service';
import { ContainerTemplatesService } from './services/container-templates.service';
import { WatcherEngineService } from './services/watcher-engine.service';
import { ProxmoxService } from './watchers/providers/proxmox/proxmox.service';
import { CONTAINER, ContainerSchema } from './schemas/container.schema';
import { PROXMOX_CONTAINER, ProxmoxContainerSchema } from './schemas/proxmox-container.schema';
import { CONTAINER_NETWORK, ContainerNetworkSchema } from './schemas/container-network.schema';
import { CONTAINER_VOLUME, ContainerVolumeSchema } from './schemas/container-volume.schema';
import { CONTAINER_REGISTRY, ContainerRegistrySchema } from './schemas/container-registry.schema';
import { CONTAINER_IMAGE, ContainerImageSchema } from './schemas/container-image.schema';
import { ContainerRepository } from './repositories/container.repository';
import { ProxmoxContainerRepository } from './repositories/proxmox-container.repository';
import { ContainerNetworkRepository } from './repositories/container-network.repository';
import { ContainerVolumeRepository } from './repositories/container-volume.repository';
import { ContainerRegistryRepository } from './repositories/container-registry.repository';
import { ContainerTemplateRepository } from './repositories/container-template.repository';
import { ContainerImageRepository } from './repositories/container-image.repository';
import { VolumesController } from './controllers/container-volumes.controller';
import { ContainersController } from './controllers/containers.controller';
import { ContainerNetworksController } from './controllers/container-networks.controller';
import { ContainerImagesController } from './controllers/container-images.controller';
import { ContainerTemplatesController } from './controllers/container-templates.controller';
import { ContainerRegistriesController } from './controllers/container-registries.controller';
import { ContainerStatsController } from './controllers/container-stats.controller';
import { ContainerLogsGateway } from './gateways/container-logs.gateway';
import { ContainerLogsService } from './services/container-logs.service';

/**
 * ContainersModule provides services for managing Docker containers, volumes, networks, images, and registries
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CONTAINER, schema: ContainerSchema },
      { name: PROXMOX_CONTAINER, schema: ProxmoxContainerSchema },
      { name: CONTAINER_NETWORK, schema: ContainerNetworkSchema },
      { name: CONTAINER_VOLUME, schema: ContainerVolumeSchema },
      { name: CONTAINER_REGISTRY, schema: ContainerRegistrySchema },
      { name: CONTAINER_IMAGE, schema: ContainerImageSchema },
    ]),
    ShellModule,
    PlaybooksModule,
    StatisticsModule,
    DevicesModule,
  ],
  controllers: [
    VolumesController,
    ContainersController,
    ContainerNetworksController,
    ContainerImagesController,
    ContainerTemplatesController,
    ContainerRegistriesController,
    ContainerStatsController,
  ],
  providers: [
    ContainerRegistriesService,
    ContainersService,
    ContainerVolumesService,
    ContainerStatsService,
    ContainerTemplatesService,
    WatcherEngineService,
    ProxmoxService,
    ContainerRepository,
    ProxmoxContainerRepository,
    ContainerNetworkRepository,
    ContainerVolumeRepository,
    ContainerRegistryRepository,
    ContainerTemplateRepository,
    ContainerImageRepository,
    ContainerLogsService,
    ContainerLogsGateway,
  ],
  exports: [
    ContainerRegistriesService,
    ContainersService,
    ContainerVolumesService,
    ContainerStatsService,
    ContainerTemplatesService,
    WatcherEngineService,
    ProxmoxService,
    ContainerRepository,
    ProxmoxContainerRepository,
    ContainerNetworkRepository,
    ContainerVolumeRepository,
    ContainerRegistryRepository,
    ContainerTemplateRepository,
    ContainerImageRepository,
    ContainerLogsService,
  ],
})
export class ContainersModule {}

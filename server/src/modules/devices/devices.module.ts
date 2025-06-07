import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnsibleVaultsModule } from '../ansible-vaults/ansible-vaults.module';
import { DeviceAuthService } from './application/services/device-auth.service';
import { DevicesService } from './application/services/devices.service';
import { DockerDeviceService } from './application/services/docker-device.service';
import { ProxmoxDeviceService } from './application/services/proxmox-device.service';
import { SensitiveInfoService } from './application/services/sensitive-info.service';
import { DEVICE_AUTH_REPOSITORY } from './domain/repositories/device-auth-repository.interface';
import { DEVICE_REPOSITORY } from './domain/repositories/device-repository.interface';
import { DEVICE_AUTH_SERVICE } from './domain/services/device-auth-service.interface';
import { DEVICES_SERVICE } from './domain/services/devices-service.interface';
import { DOCKER_DEVICE_SERVICE } from './domain/services/docker-device-service.interface';
import { PROXMOX_DEVICE_SERVICE } from './domain/services/proxmox-device-service.interface';
import { SENSITIVE_INFO_SERVICE } from './domain/services/sensitive-info.service.interface';
import { DeviceRepositoryMapper } from './infrastructure/mappers/device-repository.mapper';
import { DeviceAuthRepository } from './infrastructure/repositories/device-auth.repository';
import { DeviceRepository } from './infrastructure/repositories/device.repository';
import { DEVICE_AUTH, DeviceAuthSchema } from './infrastructure/schemas/device-auth.schema';
import { DEVICE, DeviceSchema } from './infrastructure/schemas/device.schema';
import { DevicesAuthController } from './presentation/controllers/devices-auth.controller';
import { DevicesCapabilitiesController } from './presentation/controllers/devices-capabilities.controller';
import { DevicesConfigurationController } from './presentation/controllers/devices-configuration.controller';
import { DevicesController } from './presentation/controllers/devices.controller';
import { DeviceMapper } from './presentation/mappers/device.mapper';
import { DevicesMicroserviceController } from './presentation/controllers/devices-microservice.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DEVICE, schema: DeviceSchema },
      { name: DEVICE_AUTH, schema: DeviceAuthSchema },
    ]),
    AnsibleVaultsModule,
  ],
  controllers: [
    DevicesController,
    DevicesAuthController,
    DevicesCapabilitiesController,
    DevicesConfigurationController,
    DevicesMicroserviceController,
  ],
  providers: [
    // Core services
    DevicesService,
    DeviceAuthService,
    DockerDeviceService,
    ProxmoxDeviceService,

    // Mappers
    DeviceMapper,
    DeviceRepositoryMapper,
    SensitiveInfoService,

    // Repositories
    {
      provide: DEVICE_REPOSITORY,
      useClass: DeviceRepository,
    },
    {
      provide: DEVICE_AUTH_REPOSITORY,
      useClass: DeviceAuthRepository,
    },

    // Service tokens
    {
      provide: DEVICES_SERVICE,
      useExisting: DevicesService,
    },
    {
      provide: DEVICE_AUTH_SERVICE,
      useExisting: DeviceAuthService,
    },
    {
      provide: DOCKER_DEVICE_SERVICE,
      useExisting: DockerDeviceService,
    },
    {
      provide: PROXMOX_DEVICE_SERVICE,
      useExisting: ProxmoxDeviceService,
    },
    {
      provide: SENSITIVE_INFO_SERVICE,
      useClass: SensitiveInfoService,
    },
  ],
  exports: [
    // Services
    DevicesService,
    DeviceAuthService,
    DockerDeviceService,
    ProxmoxDeviceService,

    // Service tokens
    DEVICES_SERVICE,
    DEVICE_AUTH_SERVICE,
    DOCKER_DEVICE_SERVICE,
    PROXMOX_DEVICE_SERVICE,
    SENSITIVE_INFO_SERVICE,
  ],
})
export class DevicesModule {}

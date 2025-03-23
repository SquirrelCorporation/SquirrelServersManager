import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnsibleVaultsModule } from '../ansible-vaults/ansible-vaults.module';
import { DevicesService } from './application/services/devices.service';
import { DEVICES_SERVICE } from './application/interfaces/devices-service.interface';
import { DevicesController } from './presentation/controllers/devices.controller';
import { DevicesAuthController } from './presentation/controllers/devices-auth.controller';
import { DevicesCapabilitiesController } from './presentation/controllers/devices-capabilities.controller';
import { DevicesConfigurationController } from './presentation/controllers/devices-configuration.controller';
import { DeviceRepository } from './infrastructure/repositories/device.repository';
import { DeviceAuthRepository } from './infrastructure/repositories/device-auth.repository';
import { DEVICE, DeviceSchema } from './infrastructure/schemas/device.schema';
import { DEVICE_AUTH, DeviceAuthSchema } from './infrastructure/schemas/device-auth.schema';
import { DEVICE_REPOSITORY } from './domain/repositories/device-repository.interface';
import { DEVICE_AUTH_REPOSITORY } from './domain/repositories/device-auth-repository.interface';
import { DeviceMapper } from './presentation/mappers/device.mapper';
import { DeviceRepositoryMapper } from './infrastructure/mappers/device-repository.mapper';
import { SensitiveInfoService } from './application/services/sensitive-info.service';
import { SENSITIVE_INFO_SERVICE } from './domain/services/sensitive-info.service.interface';

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
  ],
  providers: [
    DevicesService,
    DeviceMapper,
    DeviceRepositoryMapper,
    SensitiveInfoService,
    {
      provide: DEVICE_REPOSITORY,
      useClass: DeviceRepository,
    },
    {
      provide: DEVICE_AUTH_REPOSITORY,
      useClass: DeviceAuthRepository,
    },
    {
      provide: DEVICES_SERVICE,
      useExisting: DevicesService,
    },
    {
      provide: SENSITIVE_INFO_SERVICE,
      useClass: SensitiveInfoService,
    },
  ],
  exports: [
    DevicesService,
    DEVICES_SERVICE,
    SENSITIVE_INFO_SERVICE,
    SensitiveInfoService,
    DEVICE_REPOSITORY,
    DEVICE_AUTH_REPOSITORY,
  ],
})
export class DevicesModule {}

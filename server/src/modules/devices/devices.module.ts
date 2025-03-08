import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesService } from './application/services/devices.service';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DEVICE, schema: DeviceSchema },
      { name: DEVICE_AUTH, schema: DeviceAuthSchema },
    ]),
  ],
  controllers: [
    DevicesController,
    DevicesAuthController,
    DevicesCapabilitiesController,
    DevicesConfigurationController
  ],
  providers: [
    DevicesService,
    DeviceMapper,
    DeviceRepositoryMapper,
    {
      provide: DEVICE_REPOSITORY,
      useClass: DeviceRepository,
    },
    {
      provide: DEVICE_AUTH_REPOSITORY,
      useClass: DeviceAuthRepository,
    },
    {
      provide: 'IDevicesService',
      useExisting: DevicesService,
    },
  ],
  exports: [DevicesService, 'IDevicesService'],
})
export class DevicesModule {}
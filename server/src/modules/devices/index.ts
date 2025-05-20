import { DevicesModule } from './devices.module';
import { IDevice } from './domain/entities/device.entity';
import { IDeviceAuth } from './domain/entities/device-auth.entity';

// Re-export the module
export { DevicesModule };

// Re-export domain types
export { IDevice, IDeviceAuth };

// Domain entity exports
export * from './domain/entities/device.entity';
export * from './domain/entities/device-auth.entity';

// Service interface exports
export * from './domain/services/devices-service.interface';
export * from './domain/services/device-auth-service.interface';
export * from './domain/services/docker-device-service.interface';
export * from './domain/services/proxmox-device-service.interface';

// Service implementation exports
export * from './application/services/devices.service';
export * from './application/services/device-auth.service';
export * from './application/services/docker-device.service';
export * from './application/services/proxmox-device.service';

// Presentation exports
export * from './presentation/controllers/devices.controller';
export * from './presentation/dtos/device.dto';

// Export domain interfaces
export {
  ISensitiveInfoService,
  SENSITIVE_INFO_SERVICE,
} from './domain/services/sensitive-info.service.interface';

// Export application services
export { SensitiveInfoService } from './application/services/sensitive-info.service';

// Module export
export * from './devices.module';

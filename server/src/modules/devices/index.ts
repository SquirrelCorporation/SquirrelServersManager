import { DevicesModule } from './devices.module';
import { IDevice } from './domain/entities/device.entity';
import { IDeviceAuth } from './domain/entities/device-auth.entity';

// Re-export the module
export { DevicesModule };

// Re-export domain types
export { IDevice, IDeviceAuth };

// Add any necessary service exports below as the module grows

// Domain exports
export * from './domain/entities/device.entity';
export * from './domain/repositories/device-repository.interface';
export * from './domain/repositories/device-auth-repository.interface';
// Application exports
export * from './application/interfaces/devices-service.interface';
export * from './application/services/devices.service';

// Infrastructure exports
export * from './infrastructure/repositories/device.repository';

// Presentation exports
export * from './presentation/controllers/devices.controller';
export * from './presentation/dtos/device.dto';

// Export domain interfaces
export { ISensitiveInfoService, SENSITIVE_INFO_SERVICE } from './domain/services/sensitive-info.service.interface';

// Export application services
export { SensitiveInfoService } from './application/services/sensitive-info.service';

// Module export
export * from './devices.module';
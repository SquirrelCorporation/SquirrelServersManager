import { DevicesModule } from './devices.module';
import { IDevice } from './domain/entities/device.entity';
import { IDeviceAuth } from './domain/entities/device-auth.entity';

// Re-export the module
export { DevicesModule };

// Re-export domain types
export { IDevice, IDeviceAuth };

// Add any necessary service exports below as the module grows 
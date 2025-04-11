import { Global, Module } from '@nestjs/common';
import { DevicesModule, DEVICES_SERVICE, DEVICE_AUTH_SERVICE } from '@modules/devices';
import { SshConnectionService } from './services/ssh-connection.service';

@Global() // Make this module global to ensure single instance
@Module({
  imports: [DevicesModule],
  providers: [
    SshConnectionService,
    {
      provide: 'DeviceRepository',
      useExisting: DEVICES_SERVICE,
    },
    {
      provide: 'DeviceAuthRepository',
      useExisting: DEVICE_AUTH_SERVICE,
    },
  ],
  exports: [SshConnectionService],
})
export class SshInfrastructureModule {
  constructor() {
    console.log('SshInfrastructureModule initialized at', new Date().toISOString());
  }
}
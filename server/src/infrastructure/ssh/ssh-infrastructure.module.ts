import { Global, Module } from '@nestjs/common';
import { DevicesModule } from '@modules/devices';
import { DEVICE_REPOSITORY } from '@modules/devices';
import { DEVICE_AUTH_REPOSITORY } from '@modules/devices';
import { SshConnectionService } from './services/ssh-connection.service';

@Global() // Make this module global to ensure single instance
@Module({
  imports: [DevicesModule],
  providers: [
    SshConnectionService,
    {
      provide: 'DeviceRepository',
      useExisting: DEVICE_REPOSITORY,
    },
    {
      provide: 'DeviceAuthRepository',
      useExisting: DEVICE_AUTH_REPOSITORY,
    },
  ],
  exports: [SshConnectionService],
})
export class SshInfrastructureModule {
  constructor() {
    console.log('SshInfrastructureModule initialized at', new Date().toISOString());
  }
}
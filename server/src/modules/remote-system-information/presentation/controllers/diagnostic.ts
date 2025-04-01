import {
  IRemoteSystemInformationService,
  REMOTE_SYSTEM_INFORMATION_SERVICE,
} from '@modules/remote-system-information';
import { Controller, Get, Inject, Param } from '@nestjs/common';

@Controller('remote-system-information/diagnostic')
export class RemoteSystemInformationDiagnosticController {
  constructor(
    @Inject(REMOTE_SYSTEM_INFORMATION_SERVICE)
    private readonly remoteSystemInformationService: IRemoteSystemInformationService,
  ) {}

  @Get('devices/:uuid')
  async checkRemoteSystemInformationConnection(@Param('uuid') uuid: string) {
    return this.remoteSystemInformationService.testConnection(uuid);
  }
}

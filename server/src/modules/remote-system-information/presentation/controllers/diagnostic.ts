import { IRemoteSystemInformationService } from '@modules/remote-system-information';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('remote-system-information/diagnostic')
export class RemoteSystemInformationDiagnosticController {
  constructor(private readonly remoteSystemInformationService: IRemoteSystemInformationService) {}

  @Get('devices/:uuid')
  async checkRemoteSystemInformationConnection(@Param('uuid') uuid: string) {
    return this.remoteSystemInformationService.checkRemoteSystemInformationConnection(uuid);
  }
}

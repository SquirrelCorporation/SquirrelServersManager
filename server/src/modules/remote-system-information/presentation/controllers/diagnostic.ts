import {
  IRemoteSystemInformationService,
  REMOTE_SYSTEM_INFORMATION_SERVICE,
} from '@modules/remote-system-information';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PreCheckRemoteSystemInformationDto } from '../dtos/pre-check-remote-system-information.dto';

@ApiTags('RemoteSystemInformation')
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

  @Post()
  async preCheckRemoteSystemInformationConnection(
    @Body() preCheckDto: PreCheckRemoteSystemInformationDto,
  ) {
    const result =
      await this.remoteSystemInformationService.preCheckRemoteSystemInformationConnection(
        preCheckDto,
      );
    return {
      connectionStatus: result.status,
      errorMessage: result.message,
    };
  }
}

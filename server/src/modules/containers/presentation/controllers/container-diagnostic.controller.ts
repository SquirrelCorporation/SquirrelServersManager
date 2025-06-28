import { CONTAINER_SERVICE } from '@modules/containers';
import { IContainerService } from '@modules/containers/domain/interfaces/container-service.interface';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import {
  CheckDockerConnectionDoc,
  ContainerDiagnosticControllerDocs,
  PreCheckDockerConnectionDoc,
} from '../decorators/container-diagnostic.decorators';
import { PreCheckDockerConnectionDto } from '../dtos/pre-check-docker-connection.dto';

@ContainerDiagnosticControllerDocs()
@Controller('containers/diagnostic')
export class ContainerDiagnosticController {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
  ) {}

  @Get('devices/:uuid')
  @CheckDockerConnectionDoc()
  async checkDockerConnection(@Param('uuid') uuid: string) {
    return this.containerService.checkDockerConnection(uuid);
  }

  @Post()
  @PreCheckDockerConnectionDoc()
  async preCheckDockerConnection(@Body() preCheckDto: PreCheckDockerConnectionDto) {
    const result = await this.containerService.preCheckDockerConnection(preCheckDto);
    return {
      connectionStatus: result.status,
      errorMessage: result.message,
    };
  }
}

import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CONTAINER_SERVICE } from '@modules/containers';
import { IContainerService } from '@modules/containers/application/interfaces/container-service.interface';

@Controller('containers/diagnostic')
export class ContainerDiagnosticController {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
  ) {}

  @Get('devices/:uuid')
  async checkDockerConnection(@Param('uuid') uuid: string) {
    return this.containerService.checkDockerConnection(uuid);
  }
}

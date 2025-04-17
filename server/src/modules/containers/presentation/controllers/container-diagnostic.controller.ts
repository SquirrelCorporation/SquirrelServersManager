import { CONTAINER_SERVICE } from '@modules/containers';
import { IContainerService } from '@modules/containers/domain/interfaces/container-service.interface';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckDockerConnectionDoc } from '../decorators/container-diagnostic.decorators';

@ApiTags('ContainerDiagnostic')
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
}

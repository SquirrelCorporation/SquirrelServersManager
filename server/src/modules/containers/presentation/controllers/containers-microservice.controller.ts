import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '@modules/containers/domain/interfaces/container-service.interface';
import { GetContainerPayloadDto } from '@modules/mcp/application/dto/get-container.payload.dto';
import { GetContainersPayloadDto } from '@modules/mcp/application/dto/get-containers.payload.dto';
import { ContainerActionPayloadDto } from '@modules/mcp/application/dto/container-action.payload.dto';
import { IContainer } from '@modules/containers/domain/entities/container.entity';

@Controller()
export class ContainersMicroserviceController {
  private readonly logger = new Logger(ContainersMicroserviceController.name);

  constructor(@Inject(CONTAINER_SERVICE) private readonly containerService: IContainerService) {}

  @MessagePattern({ cmd: 'core_find_all_containers' })
  async findAllContainers(@Payload() payload: GetContainersPayloadDto): Promise<IContainer[]> {
    this.logger.debug(`Finding all containers with payload: ${JSON.stringify(payload)}`);
    return this.containerService.getAllContainers();
  }

  @MessagePattern({ cmd: 'core_find_container_by_id' })
  async findContainerById(@Payload() payload: GetContainerPayloadDto): Promise<IContainer | null> {
    this.logger.debug(`Finding container by ID with payload: ${JSON.stringify(payload)}`);
    return this.containerService.getContainerById(payload.containerId);
  }

  @MessagePattern({ cmd: 'core_container_action' })
  async performContainerAction(@Payload() payload: ContainerActionPayloadDto): Promise<void> {
    this.logger.debug(`Performing container action with payload: ${JSON.stringify(payload)}`);
    const { containerId, action } = payload;

    switch (action) {
      case 'start':
      case 'stop':
      case 'restart':
      case 'pause':
      case 'kill':
        await this.containerService.executeContainerAction(containerId, action);
        break;
      default:
        throw new Error(`Unsupported container action: ${action}`);
    }
  }
}

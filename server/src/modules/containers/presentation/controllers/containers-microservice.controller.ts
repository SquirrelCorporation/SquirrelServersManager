import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '@modules/containers/domain/interfaces/container-service.interface';
import { GetContainerPayloadDto } from '@modules/mcp/application/dto/get-container.payload.dto';
import { GetContainersPayloadDto } from '@modules/mcp/application/dto/get-containers.payload.dto';
import { IContainer } from '@modules/containers/domain/entities/container.entity';

@Controller()
export class ContainersMicroserviceController {
  private readonly logger = new Logger(ContainersMicroserviceController.name);

  constructor(@Inject(CONTAINER_SERVICE) private readonly containerService: IContainerService) {}

  @MessagePattern({ cmd: 'core_find_all_containers' })
  async findAllContainers(@Payload() payload: GetContainersPayloadDto): Promise<IContainer[]> {
    this.logger.log(
      `Handling core_find_all_containers via MessagePattern: ${JSON.stringify(payload)}`,
    );
    // Delegate to the service method (assuming it's named getAllContainers now or needs renaming)
    // We might need to adjust the service method name or signature if needed
    return this.containerService.getAllContainers(); // Assuming getAllContainers exists and takes no payload or payload is handled inside
  }

  @MessagePattern({ cmd: 'core_find_container_by_id' })
  async findContainerById(@Payload() payload: GetContainerPayloadDto): Promise<IContainer | null> {
    // Adjusted return type
    this.logger.log(
      `Handling core_find_container_by_id via MessagePattern for ID: ${payload.containerId}`,
    );
    if (!payload.containerId) {
      this.logger.warn('Missing containerId in core_find_container_by_id payload');
      throw new Error('Missing containerId in request payload'); // Or RpcException
    }
    // Delegate to the service method
    // Note: getContainerById might throw NotFoundException which should be handled appropriately
    // by the caller or converted to an RpcException if needed for microservice communication.
    return this.containerService.getContainerById(payload.containerId);
  }

  // Add other message patterns here for other container-related core commands
  // For example, if core needs to trigger actions:
  /*
  @MessagePattern({ cmd: 'core_start_container' })
  async startContainer(@Payload() payload: { containerId: string }): Promise<boolean> {
    this.logger.log(`Handling core_start_container for ID: ${payload.containerId}`);
    return this.containerService.executeContainerAction(payload.containerId, SsmContainer.Actions.START);
  }
  */
}

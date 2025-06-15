import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IDevice } from '@modules/devices/domain/entities/device.entity';
import { GetDevicePayloadDto } from '@modules/mcp/application/dto/get-device.payload.dto';
import { GetDevicesPayloadDto } from '@modules/mcp/application/dto/get-devices.payload.dto';
import {
  DEVICES_SERVICE,
  IDevicesService,
} from '@modules/devices/domain/services/devices-service.interface';

@Controller()
export class DevicesMicroserviceController {
  private readonly logger = new Logger(DevicesMicroserviceController.name);

  constructor(@Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService) {}

  @MessagePattern({ cmd: 'core_find_all_devices' })
  async findAllDevices(@Payload() payload: GetDevicesPayloadDto): Promise<IDevice[] | null> {
    this.logger.log(
      `Handling core_find_all_devices via MessagePattern: ${JSON.stringify(payload)}`,
    );
    // Delegate to service method
    return await this.devicesService.findAll(); // Assuming findAll exists and takes no payload or payload is handled inside
  }

  @MessagePattern({ cmd: 'core_find_device_by_uuid' })
  async findDeviceByUuid(@Payload() payload: GetDevicePayloadDto): Promise<IDevice | null> {
    this.logger.log(
      `Handling core_find_device_by_uuid via MessagePattern for UUID: ${payload.deviceUuid}`,
    );
    if (!payload.deviceUuid) {
      this.logger.warn('Missing deviceUuid in core_find_device_by_uuid payload');
      // Consider throwing RpcException for microservice errors
      throw new Error('Missing deviceUuid in request payload');
    }
    // Delegate to service method
    return await this.devicesService.findOneByUuid(payload.deviceUuid);
  }

  // Add other message patterns for device-related core commands if needed
}

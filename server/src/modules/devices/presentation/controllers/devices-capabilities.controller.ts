import { Body, Controller, Param, Post } from '@nestjs/common';
import { DevicesService } from '../../application/services/devices.service';
import {
  UpdateDeviceCapabilitiesDto
} from '../dtos/device-capabilities.dto';
import { DeviceMapper } from '../mappers/device.mapper';

@Controller('api/devices')
export class DevicesCapabilitiesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly deviceMapper: DeviceMapper
  ) {}

  @Post(':uuid/capabilities')
  async updateDeviceCapabilities(
    @Param('uuid') uuid: string,
    @Body() updateDeviceCapabilitiesDto: { capabilities: UpdateDeviceCapabilitiesDto },
  ) {
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error(`Device with UUID ${uuid} not found`);
    }

    // Create an update object that only has capabilities property
    const updateData = {
      capabilities: updateDeviceCapabilitiesDto.capabilities,
    };

    // Update and return the device
    const updatedDevice = this.deviceMapper.updateEntity(device, updateData);
    return this.devicesService.update(updatedDevice);
  }
}
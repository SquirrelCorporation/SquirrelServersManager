import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Events from 'src/core/events/events';
import { DevicesService } from '../../application/services/devices.service';
import {
  DockerConfigurationDto,
  ProxmoxConfigurationDto,
  SystemInformationConfigurationDto,
} from '../dtos/device-configuration.dto';
import { DeviceMapper } from '../mappers/device.mapper';
import {
  DEVICES_CONFIGURATION_TAG,
  UpdateDockerConfigurationDoc,
  UpdateProxmoxConfigurationDoc,
  UpdateSystemInformationConfigurationDoc,
} from '../decorators/devices-configuration.decorators';

@ApiTags(DEVICES_CONFIGURATION_TAG)
@Controller('devices')
export class DevicesConfigurationController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly deviceMapper: DeviceMapper,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Patch(':uuid/configuration/containers/docker')
  @UpdateDockerConfigurationDoc()
  async updateDockerConfiguration(
    @Param('uuid') uuid: string,
    @Body() dockerConfigurationDto: DockerConfigurationDto,
  ) {
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error(`Device with UUID ${uuid} not found`);
    }

    // Update only the docker configuration part
    const updateData = {
      configuration: {
        ...device.configuration,
        containers: {
          ...device.configuration.containers,
          docker: dockerConfigurationDto,
        },
      },
    };

    // Update and return the device
    const updatedDevice = this.deviceMapper.updateEntity(device, updateData);
    return this.devicesService.update(updatedDevice);
  }

  @Patch(':uuid/configuration/containers/proxmox')
  @UpdateProxmoxConfigurationDoc()
  async updateProxmoxConfiguration(
    @Param('uuid') uuid: string,
    @Body() proxmoxConfigurationDto: ProxmoxConfigurationDto,
  ) {
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error(`Device with UUID ${uuid} not found`);
    }

    // Update only the proxmox configuration part
    const updateData = {
      configuration: {
        ...device.configuration,
        containers: {
          ...device.configuration.containers,
          proxmox: proxmoxConfigurationDto,
        },
      },
    };

    // Update and return the device
    const updatedDevice = this.deviceMapper.updateEntity(device, updateData);
    return this.devicesService.update(updatedDevice);
  }

  @Patch(':uuid/configuration/system-information')
  @UpdateSystemInformationConfigurationDoc()
  async updateSystemInformationConfiguration(
    @Param('uuid') uuid: string,
    @Body()
    systemInformationDto: { systemInformationConfiguration: SystemInformationConfigurationDto },
  ) {
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error(`Device with UUID ${uuid} not found`);
    }

    // Update only the system information configuration part
    const updateData = {
      configuration: {
        ...device.configuration,
        systemInformation: {
          ...device.configuration.systemInformation,
          ...systemInformationDto.systemInformationConfiguration,
        },
      },
    };

    // Update and return the device
    const updatedDevice = this.deviceMapper.updateEntity(device, updateData);
    const result = await this.devicesService.update(updatedDevice);
    
    // Emit event to restart watchers with new configuration
    if (result) {
      this.eventEmitter.emit(Events.DEVICE_CONFIGURATION_UPDATED, { device: result });
    }
    
    return result;
  }
}

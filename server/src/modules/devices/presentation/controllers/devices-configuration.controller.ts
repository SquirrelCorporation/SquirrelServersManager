import { Body, Controller, Param, Post } from '@nestjs/common';
import { DevicesService } from '../../application/services/devices.service';
import { DockerConfigurationDto, ProxmoxConfigurationDto, SystemInformationConfigurationDto } from '../dtos/device-configuration.dto';
import { DeviceMapper } from '../mappers/device.mapper';

@Controller('devices')
export class DevicesConfigurationController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly deviceMapper: DeviceMapper
  ) {}

  @Post(':uuid/configuration/containers/docker')
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

  @Post(':uuid/configuration/containers/proxmox')
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

  @Post(':uuid/configuration/systemInformation')
  async updateSystemInformationConfiguration(
    @Param('uuid') uuid: string,
    @Body() systemInformationDto: { systemInformationConfiguration: SystemInformationConfigurationDto },
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
    return this.devicesService.update(updatedDevice);
  }
}
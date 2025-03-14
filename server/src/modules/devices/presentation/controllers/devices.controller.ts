import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DevicesService } from '../../application/services/devices.service';
import { CreateDeviceDto, UpdateDeviceDto } from '../dtos/device.dto';
import { CreateDeviceAuthDto, UpdateDeviceAuthDto } from '../dtos/device-auth.dto';
import { DeviceMapper } from '../mappers/device.mapper';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly deviceMapper: DeviceMapper
  ) {}

  @Post()
  async createDevice(@Body() createDeviceDto: CreateDeviceDto) {
    const device = this.deviceMapper.toEntity(createDeviceDto);
    return this.devicesService.create(device);
  }

  @Get()
  async findAllDevices() {
    return this.devicesService.findAll();
  }

  @Get('filter')
  async findDevicesWithFilter(@Query() filter: any) {
    return this.devicesService.findWithFilter(filter);
  }

  @Get(':uuid')
  async findOneDevice(@Param('uuid') uuid: string) {
    return this.devicesService.findOneByUuid(uuid);
  }

  @Patch(':uuid')
  async updateDevice(
    @Param('uuid') uuid: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error(`Device with UUID ${uuid} not found`);
    }

    const updatedDevice = this.deviceMapper.updateEntity(device, updateDeviceDto);
    return this.devicesService.update(updatedDevice);
  }

  @Delete(':uuid')
  async removeDevice(@Param('uuid') uuid: string) {
    return this.devicesService.deleteByUuid(uuid);
  }

  @Post(':uuid/auth')
  async createDeviceAuth(
    @Param('uuid') uuid: string,
    @Body() createDeviceAuthDto: CreateDeviceAuthDto,
  ) {
    return this.devicesService.createOrUpdateDeviceAuth(createDeviceAuthDto, uuid);
  }

  @Get(':uuid/auth')
  async findDeviceAuth(@Param('uuid') uuid: string) {
    return this.devicesService.findDeviceAuthByDeviceUuid(uuid);
  }

  @Patch(':uuid/auth')
  async updateDeviceAuth(
    @Param('uuid') uuid: string,
    @Body() updateDeviceAuthDto: UpdateDeviceAuthDto,
  ) {
    return this.devicesService.updateExistingDeviceAuth(updateDeviceAuthDto, uuid);
  }

  @Delete(':uuid/auth')
  async removeDeviceAuth(@Param('uuid') uuid: string) {
    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error(`Device with UUID ${uuid} not found`);
    }

    return this.devicesService.deleteDeviceAuthByDevice(device);
  }
}
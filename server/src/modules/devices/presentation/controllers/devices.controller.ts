import { parse } from 'url';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { IDevice } from '@modules/devices';
import { DeviceMapper } from '../mappers/device.mapper';
import { CreateDeviceDto, UpdateDeviceDto } from '../dtos/device.dto';
import { DevicesService } from '../../application/services/devices.service';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly deviceMapper: DeviceMapper,
  ) {}

  @Post()
  async createDevice(@Body() createDeviceDto: CreateDeviceDto) {
    const device = this.deviceMapper.toEntity(createDeviceDto);
    return this.devicesService.create(device);
  }

  @Get()
  async findDevices(@Req() req) {
    const realUrl = req.url;
    const { current = 1, pageSize = 10 } = req.query;
    const params = parse(realUrl, true).query as unknown as API.PageParams &
      API.DeviceItem & {
        sorter: any;
        filter: any;
      };
    const devices = await this.devicesService.findAll();
    if (!devices) {
      return [];
    }
    // Use the separated services
    let dataSource = sortByFields<IDevice>(devices, params);
    dataSource = filterByFields(dataSource, params);
    //TODO: update validator
    dataSource = filterByQueryParams(dataSource, params, ['ip', 'uuid', 'status', 'hostname']);
    const totalBeforePaginate = dataSource?.length || 0;
    // Add pagination
    dataSource = paginate(dataSource, current as number, pageSize as number);

    return {
      data: dataSource,
      metadata: {
        total: totalBeforePaginate,
        current: current as number,
        pageSize: pageSize as number,
      },
    };
  }

  @Get('/all')
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
  async updateDevice(@Param('uuid') uuid: string, @Body() updateDeviceDto: UpdateDeviceDto) {
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
}

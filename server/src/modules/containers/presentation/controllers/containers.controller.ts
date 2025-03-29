import { parse } from 'url';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { IContainerService } from '../../application/interfaces/container-service.interface';
import { CONTAINER_SERVICE } from '../../application/interfaces/container-service.interface';
import { ContainersQueryDto } from '../dtos/container-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';

@Controller('containers')
@UseGuards(JwtAuthGuard)
export class ContainersController {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
  ) {}

  @Get()
  async getAllContainers(@Req() req, @Query() query: ContainersQueryDto) {
    const realUrl = req.url;
    const { current = 1, pageSize = 10 } = query;
    const params = parse(realUrl, true).query as any;

    // Get all containers
    const containers = await this.containerService.getAllContainers();

    // Apply sorting, filtering and pagination
    let dataSource = sortByFields(containers, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
      params,
      ['status[]', 'name', 'updateAvailable', 'deviceUuid'],
    );

    const totalBeforePaginate = dataSource?.length || 0;

    // Add pagination
    dataSource = paginate(dataSource, current as number, pageSize as number);

    return new PaginatedResponseDto(dataSource, {
      total: totalBeforePaginate,
      pageSize,
      current: parseInt(`${current}`, 10) || 1,
    });
  }

  @Get(':uuid')
  async getContainerByUuid(@Param('uuid') uuid: string) {
    return this.containerService.getContainerByUuid(uuid);
  }

  @Get('device/:deviceUuid')
  async getContainersByDeviceUuid(@Param('deviceUuid') deviceUuid: string) {
    return this.containerService.getContainersByDeviceUuid(deviceUuid);
  }

  @Patch(':uuid')
  async updateContainer(@Param('uuid') uuid: string, @Body() containerData: Partial<any>) {
    return this.containerService.updateContainer(uuid, containerData);
  }

  @Delete(':uuid')
  async deleteContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.deleteContainer(uuid) };
  }

  @Post(':uuid/start')
  async startContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.startContainer(uuid) };
  }

  @Post(':uuid/stop')
  async stopContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.stopContainer(uuid) };
  }

  @Post(':uuid/restart')
  async restartContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.restartContainer(uuid) };
  }

  @Post(':uuid/pause')
  async pauseContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.pauseContainer(uuid) };
  }

  @Post(':uuid/unpause')
  async unpauseContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.unpauseContainer(uuid) };
  }

  @Post(':uuid/kill')
  async killContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.killContainer(uuid) };
  }

  @Get(':uuid/logs')
  async getContainerLogs(@Param('uuid') uuid: string, @Query() options: any) {
    return this.containerService.getContainerLogs(uuid, options);
  }
}

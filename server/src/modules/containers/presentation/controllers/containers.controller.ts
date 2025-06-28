import { parse } from 'url';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContainersQueryDto } from '@modules/containers/presentation/dtos/container-query.dto';
import { ContainerResponseDto } from '@modules/containers/presentation/dtos/container-response.dto';
import { PaginatedResponseDto } from '@modules/containers/presentation/dtos/paginated-response.dto';
import { UpdateContainerNameDto } from '@modules/containers/presentation/dtos/update-container.dto';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import {
  ContainerActionDoc,
  DeleteContainerDoc,
  GetContainerByIdDoc,
  GetContainersByDeviceUuidDoc,
  GetContainersDoc,
  RefreshContainersDoc,
  UpdateContainerDoc,
  UpdateContainerNameDoc,
} from '../decorators/container.decorators';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../domain/interfaces/container-service.interface';
import { CONTAINER_TAG } from '../decorators/container.decorators';

/**
 * Containers Controller
 *
 * This controller handles operations related to containers, including
 * fetching, creating, updating, and deleting containers.
 */
@ApiTags(CONTAINER_TAG)
@Controller('containers')
export class ContainersController {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
  ) {}

  @Get()
  @GetContainersDoc()
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

  @Get(':id')
  @GetContainerByIdDoc()
  async getContainerById(@Param('id') id: string): Promise<ContainerResponseDto> {
    const container = await this.containerService.getContainerById(id);
    return container as ContainerResponseDto;
  }

  @Get('device/:deviceUuid')
  @GetContainersByDeviceUuidDoc()
  async getContainersByDeviceUuid(
    @Param('deviceUuid') deviceUuid: string,
  ): Promise<ContainerResponseDto[]> {
    const containers = await this.containerService.getContainersByDeviceUuid(deviceUuid);
    return containers as ContainerResponseDto[];
  }

  @Put(':id')
  @UpdateContainerDoc()
  async updateContainer(
    @Param('id') id: string,
    @Body() container: ContainerResponseDto,
  ): Promise<void> {
    await this.containerService.updateContainer(id, container);
  }

  @Put(':id/name')
  @UpdateContainerNameDoc()
  async updateContainerCustomName(
    @Param('id') id: string,
    @Body() updateContainerNameDto: UpdateContainerNameDto,
  ): Promise<void> {
    await this.containerService.updateContainerName(id, updateContainerNameDto.name);
  }

  @Delete(':id')
  @DeleteContainerDoc()
  async deleteContainer(@Param('id') id: string): Promise<void> {
    await this.containerService.deleteContainer(id);
  }

  @Post(':id/docker/actions/:action')
  @ContainerActionDoc()
  async containerAction(@Param('id') id: string, @Param('action') action: string): Promise<void> {
    await this.containerService.executeContainerAction(id, action);
  }

  @Post('refresh')
  @RefreshContainersDoc()
  async refreshAllContainers(): Promise<void> {
    await this.containerService.refreshAllContainers();
  }
}

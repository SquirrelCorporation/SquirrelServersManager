import { parse } from 'url';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import {
  BadRequestException,
  EntityNotFoundException,
  ServiceUnavailableException,
} from '@infrastructure/exceptions';
import { IContainerEntity } from '@modules/containers/domain/entities/container.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { SsmContainer } from 'ssm-shared-lib';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../applicati../../domain/interfaces/container-service.interface';
import { ContainersQueryDto } from '../dtos/container-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';

@Controller('containers')
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

  @Get(':id')
  async getContainerById(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Container id is required');
    }

    const container = await this.containerService.getContainerById(id);
    if (!container) {
      throw new EntityNotFoundException('Container', id);
    }

    return container;
  }

  @Get('device/:deviceUuid')
  async getContainersByDeviceUuid(@Param('deviceUuid') deviceUuid: string) {
    return this.containerService.getContainersByDeviceUuid(deviceUuid);
  }

  @Patch(':id')
  async updateContainer(@Param('id') id: string, @Body() containerData: Partial<IContainerEntity>) {
    return this.containerService.updateContainer(id, containerData);
  }

  @Post(':id/name')
  async updateContainerCustomName(@Param('id') id: string, @Body() body: { name: string }) {
    return this.containerService.updateContainerName(id, body.name);
  }

  @Delete(':id')
  async deleteContainer(@Param('id') id: string) {
    return { success: await this.containerService.deleteContainer(id) };
  }

  @Post(':id/docker/actions/:action')
  async startContainer(@Param('id') id: string, @Param('action') action: SsmContainer.Actions) {
    if (!id) {
      throw new BadRequestException('Container id is required');
    }

    try {
      const result = await this.containerService.executeContainerAction(id, action);
      return result;
    } catch (error: any) {
      if (error.message && error.message.includes('not found')) {
        throw new EntityNotFoundException('Container', id);
      } else if (error.message && error.message.includes('connection')) {
        throw new ServiceUnavailableException(`Docker daemon is not available: ${error.message}`);
      } else {
        throw new BadRequestException(`Failed to perform action on container: ${error.message}`);
      }
    }
  }
}

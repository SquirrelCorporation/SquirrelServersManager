import { parse } from 'url';
import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import { PaginatedResponseDto } from '@modules/containers/presentation/dtos/paginated-response.dto';
import { Body, Controller, Delete, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService,
} from '../../domain/interfaces/container-networks-service.interface';
import { DeployNetworkDto } from '../dtos/create-network.dto';
import {
  CONTAINER_NETWORKS_TAG,
  CreateNetworkDoc,
  DeleteNetworkDoc,
  GetNetworksDoc,
} from '../decorators/container-networks.decorators';

/**
 * Container Networks Controller
 *
 * This controller handles operations related to container networks, including
 * fetching, creating, and deleting networks.
 */
@ApiTags(CONTAINER_NETWORKS_TAG)
@Controller('container-networks')
export class ContainerNetworksController {
  constructor(
    @Inject(CONTAINER_NETWORKS_SERVICE)
    private readonly networksService: IContainerNetworksService,
  ) {}

  /**
   * Get all networks with pagination, sorting, and filtering
   */
  @Get()
  @GetNetworksDoc()
  async getNetworks(@Req() req) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as any;

    const networks = await this.networksService.getAllNetworks();

    // Apply sorting, filtering, and pagination
    let dataSource = sortByFields(networks, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.deviceUuid })),
      params,
      ['name', 'scope', 'driver', 'deviceUuid'],
    );

    const totalBeforePaginate = dataSource?.length || 0;
    if (current && pageSize) {
      dataSource = paginate(dataSource, current as number, pageSize as number);
    }
    return new PaginatedResponseDto(dataSource, {
      total: totalBeforePaginate,
      pageSize,
      current: parseInt(`${current}`, 10) || 1,
    });
  }

  @Post()
  @CreateNetworkDoc()
  async createNetwork(
    @User() user,
    @Param('deviceUuid') deviceUuid: string,
    @Body() networkData: DeployNetworkDto,
  ): Promise<{ execId: string }> {
    const execId = await this.networksService.createNetworkWithPlaybook(
      deviceUuid,
      networkData,
      user,
    );
    return { execId };
  }

  @Delete(':uuid')
  @DeleteNetworkDoc()
  async deleteNetwork(@Param('uuid') uuid: string) {
    const success = await this.networksService.deleteNetwork(uuid);
    return { success };
  }
}

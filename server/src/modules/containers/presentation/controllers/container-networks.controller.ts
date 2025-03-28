import { parse } from 'url';
import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaginatedResponseDto } from '@modules/containers/presentation/dtos/paginated-response.dto';
import { IUser } from '@modules/users/domain/entities/user.entity';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { IContainerNetworksService } from '../../application/interfaces/container-networks-service.interface';
import { CONTAINER_NETWORKS_SERVICE } from '../../application/interfaces/container-networks-service.interface';
import { DeployNetworkDto } from '../dtos/create-network.dto';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../../helpers/query/SorterHelper';

@Controller('container-networks')
@UseGuards(JwtAuthGuard)
export class ContainerNetworksController {
  constructor(
    @Inject(CONTAINER_NETWORKS_SERVICE)
    private readonly networksService: IContainerNetworksService,
  ) {}

  /**
   * Get all networks with pagination, sorting, and filtering
   */
  @Get()
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

  @Post('device/:deviceUuid')
  async createNetwork(
    @Req() req,
    @Param('deviceUuid') deviceUuid: string,
    @Body() networkData: DeployNetworkDto,
  ): Promise<{ execId: string }> {
    const execId = await this.networksService.deployNetwork(
      deviceUuid,
      networkData,
      req.user as IUser,
    );
    return { execId };
  }

  @Delete(':uuid')
  async deleteNetwork(@Param('uuid') uuid: string) {
    const success = await this.networksService.deleteNetwork(uuid);
    return { success };
  }
}

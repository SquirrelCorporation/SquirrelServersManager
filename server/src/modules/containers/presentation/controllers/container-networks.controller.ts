import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { parse } from 'url';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { ContainerNetworksServiceInterface } from '../../application/interfaces/container-networks-service.interface';
import { CONTAINER_NETWORKS_SERVICE } from '../../application/interfaces/container-networks-service.interface';
import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';
import { CreateNetworkDto } from '../dtos/create-network.dto';
import { UpdateNetworkDto } from '../dtos/update-network.dto';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../../helpers/query/SorterHelper';

@Controller('networks')
@UseGuards(JwtAuthGuard)
export class ContainerNetworksController {
  constructor(
    @Inject(CONTAINER_NETWORKS_SERVICE)
    private readonly networksService: ContainerNetworksServiceInterface,
  ) {}

  /**
   * Get all networks with pagination, sorting, and filtering
   */
  @Get()
  async getNetworks(@Req() req, @Res() res) {
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

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Got networks',
      data: dataSource,
      meta: {
        total: totalBeforePaginate,
        success: true,
        pageSize,
        current: parseInt(`${params.current}`, 10) || 1,
      },
    });
  }

  @Get(':uuid')
  async getNetworkByUuid(@Param('uuid') uuid: string) {
    return this.networksService.getNetworkByUuid(uuid);
  }

  @Get('device/:deviceUuid')
  async getNetworksByDeviceUuid(@Param('deviceUuid') deviceUuid: string) {
    return this.networksService.getNetworksByDeviceUuid(deviceUuid);
  }

  @Post('device/:deviceUuid')
  async createNetwork(
    @Param('deviceUuid') deviceUuid: string,
    @Body() networkData: CreateNetworkDto,
  ): Promise<ContainerNetworkEntity> {
    return this.networksService.createNetwork(deviceUuid, networkData);
  }

  @Patch(':uuid')
  async updateNetwork(
    @Param('uuid') uuid: string,
    @Body() networkData: UpdateNetworkDto,
  ): Promise<ContainerNetworkEntity> {
    return this.networksService.updateNetwork(uuid, networkData);
  }

  @Delete(':uuid')
  async deleteNetwork(@Param('uuid') uuid: string) {
    const success = await this.networksService.deleteNetwork(uuid);
    return { success };
  }

  @Post(':networkUuid/container/:containerUuid/connect')
  async connectContainerToNetwork(
    @Param('networkUuid') networkUuid: string,
    @Param('containerUuid') containerUuid: string,
  ) {
    const success = await this.networksService.connectContainerToNetwork(
      networkUuid,
      containerUuid,
    );
    return { success };
  }

  @Post(':networkUuid/container/:containerUuid/disconnect')
  async disconnectContainerFromNetwork(
    @Param('networkUuid') networkUuid: string,
    @Param('containerUuid') containerUuid: string,
  ) {
    const success = await this.networksService.disconnectContainerFromNetwork(
      networkUuid,
      containerUuid,
    );
    return { success };
  }
}
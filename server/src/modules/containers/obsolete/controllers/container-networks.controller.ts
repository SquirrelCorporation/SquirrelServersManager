import { parse } from 'url';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainerNetworkRepository } from '../repositories/container-network.repository';
import { PlaybookRepository } from '../../playbooks/repositories/playbook.repository';
import { PlaybookService } from '../../playbooks/services/playbook.service';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';

@Controller('networks')
@UseGuards(JwtAuthGuard)
export class ContainerNetworksController {
  constructor(
    private readonly containerNetworkRepository: ContainerNetworkRepository,
    private readonly playbookRepository: PlaybookRepository,
    private readonly playbookService: PlaybookService,
  ) {}

  /**
   * Get all networks with pagination, sorting, and filtering
   */
  @Get()
  async getNetworks(@Req() req, @Res() res) {
    const realUrl = req.url;
    const { current, pageSize } = req.query;
    const params = parse(realUrl, true).query as unknown as API.PageParams &
      API.ContainerNetwork & {
        sorter: any;
        filter: any;
      };

    const networks = await this.containerNetworkRepository.findAll();

    // Apply sorting, filtering, and pagination
    let dataSource = sortByFields(networks, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(
      dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
      params,
      ['attachable', 'name', 'scope', 'driver', 'deviceUuid'],
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

  /**
   * Create a new network
   */
  @Post()
  async postNetwork(@Req() req, @Res() res) {
    const { config, target }: API.CreateNetwork = req.body;

    const playbook = await this.playbookRepository.findOneByUniqueQuickReference('createDockerNetwork');
    if (!playbook) {
      throw new HttpException('Playbook \'createDockerNetwork\' not found', HttpStatus.NOT_FOUND);
    }

    if (!req.user) {
      throw new HttpException('No user', HttpStatus.NOT_FOUND);
    }

    const createNetworkConfig: API.ExtraVars = [];
    Object.keys(config).forEach((key) => {
      let value = config[key];
      if (value) {
        if (typeof value !== 'string') {
          // If value is an object (including arrays), stringify it
          value = JSON.stringify(value);
        }
        createNetworkConfig.push({ extraVar: key, value: value });
      }
    });

    try {
      const execId = await this.playbookService.executePlaybook(
        playbook,
        req.user,
        [target],
        createNetworkConfig,
      );

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Execution in progress',
        data: { execId: execId } as API.ExecId,
      });
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

import { parse } from 'url';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { API, SsmContainer } from 'ssm-shared-lib';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainersService } from '../services/containers.service';
import { ContainerRepository } from '../repositories/container.repository';
import { ProxmoxContainerRepository } from '../repositories/proxmox-container.repository';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { BadRequestError, InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { WatcherEngineService } from '../services/watcher-engine.service';
import { UpdateContainerNameDto } from '../dto/update-container-name.dto';
import { ContainerActionDto } from '../dto/container-action.dto';

@Controller('containers')
@UseGuards(JwtAuthGuard)
export class ContainersController {
  constructor(
    private readonly containersService: ContainersService,
    private readonly containerRepository: ContainerRepository,
    private readonly proxmoxContainerRepository: ProxmoxContainerRepository,
    private readonly watcherEngineService: WatcherEngineService,
  ) {}

  /**
   * Get all containers with pagination, sorting, and filtering
   * @param req Express request
   * @param res Express response
   */
  @Get()
  async getContainers(@Req() req: Request, @Res() res: Response): Promise<void> {
    const realUrl = req.url;
    const { current = 1, pageSize = 10 } = req.query;
    const params = parse(realUrl, true).query as unknown as API.PageParams &
      API.Container & {
        sorter: any;
        filter: any;
      };

    const containers = (await Promise.all([
      this.containerRepository.findAll(),
      this.proxmoxContainerRepository.findAll(),
    ]))
      .filter(Boolean) // Remove any undefined or null
      .flat() as API.Container[];

    // Use the separated services
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

    new SuccessResponse('Get containers', dataSource, {
      total: totalBeforePaginate,
      success: true,
      pageSize,
      current: parseInt(`${params.current}`, 10) || 1,
    }).send(res);
  }

  /**
   * Update the custom name of a container
   * @param id Container ID
   * @param updateNameDto DTO with the new custom name
   * @param res Express response
   */
  @Post(':id/name')
  async postCustomNameOfContainer(
    @Param('id') id: string,
    @Body() updateNameDto: UpdateContainerNameDto,
    @Res() res: Response,
  ): Promise<void> {
    const container = await this.containerRepository.findContainerById(id);
    if (!container) {
      throw new NotFoundError(`Container with id ${id} not found`);
    }
    await this.containersService.updateCustomName(updateNameDto.customName, container);
    new SuccessResponse('Updated container', {}).send(res);
  }

  /**
   * Refresh all containers
   * @param res Express response
   */
  @Post('refresh')
  async refreshAll(@Res() res: Response): Promise<void> {
    try {
      await Promise.all(
        Object.values(this.watcherEngineService.getStates().watcher).map((watcher) => watcher.watch()),
      );
      res.status(200).json(new SuccessResponse('Containers refreshed'));
    } catch (error) {
      throw new InternalError('Error refreshing containers');
    }
  }

  /**
   * Perform an action on a Docker container
   * @param id Container ID
   * @param action Action to perform
   * @param res Express response
   */
  @Post(':id/docker/action/:action')
  async postDockerContainerAction(
    @Param('id') id: string,
    @Param('action') action: string,
    @Res() res: Response,
  ): Promise<void> {
    const container = await this.containerRepository.findContainerById(id);
    if (!container) {
      throw new NotFoundError(`Container with id ${id} not found`);
    }
    if (!(Object.values(SsmContainer.Actions) as string[]).includes(action)) {
      throw new BadRequestError('Invalid action');
    }
    await this.containersService.performDockerAction(
      container,
      action as SsmContainer.Actions,
    );
    new SuccessResponse('Performed container action', {}).send(res);
  }

  /**
   * Perform an action on a Proxmox container
   * @param uuid Container UUID
   * @param action Action to perform
   * @param res Express response
   */
  @Post(':uuid/proxmox/action/:action')
  async postProxmoxContainerAction(
    @Param('uuid') uuid: string,
    @Param('action') action: string,
    @Res() res: Response,
  ): Promise<void> {
    const container = await this.proxmoxContainerRepository.findContainerByUuid(uuid);
    if (!container) {
      throw new NotFoundError(`Container with uuid ${uuid} not found`);
    }
    if (!(Object.values(SsmContainer.Actions) as string[]).includes(action)) {
      throw new BadRequestError('Invalid action');
    }
    const result = await this.containersService.performProxmoxAction(
      container,
      action as SsmContainer.Actions,
    );
    new SuccessResponse('Performed container action', result).send(res);
  }
}

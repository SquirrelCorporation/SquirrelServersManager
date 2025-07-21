import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../domain/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService,
} from '../../domain/interfaces/container-stats-service.interface';
import {
  ContainerCountParamDto,
  ContainerStatParamDto,
  ContainerStatsQueryDto,
} from '../dtos/container-stats.dto';
import {
  CONTAINER_STATS_TAG,
  GetAveragedStatsDoc,
  GetContainerCountDoc,
  GetContainerStatDoc,
  GetContainerStatsDoc,
} from '../decorators/container-stats.decorators';

/**
 * Container Statistics Controller
 *
 * This controller handles operations related to container statistics, including
 * fetching container stats by ID and type, getting container stats by container ID and type,
 * getting the number of containers by status, and getting averaged container stats.
 */
@ApiTags(CONTAINER_STATS_TAG)
@Controller('container-statistics')
@UsePipes(new ValidationPipe({ transform: true }))
export class ContainerStatsController {
  private readonly logger = new Logger(ContainerStatsController.name);

  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
    @Inject(CONTAINER_STATS_SERVICE)
    private readonly containerStatsService: IContainerStatsService,
  ) {}

  /**
   * Get container stat by container ID and type
   * @param params Container stat parameters
   * @returns Container stat
   */
  @Get(':id/stat/:type')
  @GetContainerStatDoc()
  async getContainerStatByContainerId(@Param() params: ContainerStatParamDto) {
    const container = await this.containerService.getContainerById(params.id);
    if (container == null) {
      throw new HttpException(`Container not found ${params.id}`, HttpStatus.NOT_FOUND);
    }
    this.logger.debug(
      `getContainerStatByContainerId - container: ${container.id}, type: ${params.type}`,
    );
    try {
      const stat = await this.containerStatsService.getStatByDeviceAndType(container, params.type);
      return stat ? stat[0] : null;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get container stats by container ID and type
   * @param params Container stats parameters
   * @param query Query parameters
   * @returns Container stats
   */
  @Get(':id/stats/:type')
  @GetContainerStatsDoc()
  async getContainerStatsByContainerId(
    @Param() params: ContainerStatParamDto,
    @Query() query: ContainerStatsQueryDto,
  ) {
    const container = await this.containerService.getContainerById(params.id);
    if (container == null) {
      throw new HttpException(`Container not found ${params.id}`, HttpStatus.NOT_FOUND);
    }
    this.logger.debug(
      `getContainerStatsByContainerId - container: ${container.id}, type: ${params.type}, query: ${JSON.stringify(query)}`,
      container,
    );
    try {
      const stats = await this.containerStatsService.getStatsByDeviceAndType(
        container,
        query.from ? parseInt(query.from) : 24,
        params.type,
      );
      return stats;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get number of containers by status
   * @param params Container count parameters
   * @returns Number of containers
   */
  @Get('count/:status')
  @GetContainerCountDoc()
  async getNbContainersByStatus(@Param() params: ContainerCountParamDto) {
    try {
      let nbContainers: number;

      if (params.status === 'all') {
        nbContainers = await this.containerService.countContainers();
      } else {
        nbContainers = await this.containerService.countContainersByStatus(params.status);
      }

      return nbContainers;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get averaged container stats
   * @returns Averaged container stats
   */
  @Get('averaged')
  @GetAveragedStatsDoc()
  async getAveragedStats() {
    try {
      const stats = await this.containerStatsService.getCpuAndMemAveragedStats();
      return stats;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

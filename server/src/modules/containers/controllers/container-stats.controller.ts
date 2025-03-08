import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainerRepository } from '../repositories/container.repository';
import { ContainerStatsService } from '../services/container-stats.service';
import {
  ContainerCountParamDto,
  ContainerStatParamDto,
  ContainerStatsQueryDto
} from '../dto/container-stats.dto';

/**
 * Controller for container statistics
 */
@Controller('container-stats')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ContainerStatsController {
  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly containerStatsService: ContainerStatsService,
  ) {}

  /**
   * Get container stat by container ID and type
   * @param params Container stat parameters
   * @returns Container stat
   */
  @Get(':id/stat/:type')
  async getContainerStatByContainerId(@Param() params: ContainerStatParamDto) {
    const container = await this.containerRepository.findContainerById(params.id);
    if (container == null) {
      throw new HttpException(`Container not found ${params.id}`, HttpStatus.NOT_FOUND);
    }

    try {
      const stat = await this.containerStatsService.getStatByDeviceAndType(container, params.type);
      return {
        status: 'success',
        message: 'Get container stat by container id successful',
        data: stat ? stat[0] : null,
      };
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
  async getContainerStatsByContainerId(
    @Param() params: ContainerStatParamDto,
    @Query() query: ContainerStatsQueryDto,
  ) {
    const container = await this.containerRepository.findContainerById(params.id);
    if (container == null) {
      throw new HttpException(`Container not found ${params.id}`, HttpStatus.NOT_FOUND);
    }

    try {
      const stats = await this.containerStatsService.getStatsByDeviceAndType(
        container,
        query.from,
        params.type,
      );
      return {
        status: 'success',
        message: 'Get container stats by container id successful',
        data: stats,
      };
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
  async getNbContainersByStatus(@Param() params: ContainerCountParamDto) {
    try {
      let nbContainers: number;

      if (params.status === 'all') {
        nbContainers = await this.containerRepository.count();
      } else {
        nbContainers = await this.containerRepository.countByStatus(params.status);
      }

      return {
        status: 'success',
        message: 'Get nb containers',
        data: nbContainers,
      };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get averaged container stats
   * @returns Averaged container stats
   */
  @Get('averaged')
  async getAveragedStats() {
    try {
      const stats = await this.containerStatsService.getCpuAndMemAveragedStats();
      return {
        status: 'success',
        message: 'Get averaged container stats',
        data: stats,
      };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
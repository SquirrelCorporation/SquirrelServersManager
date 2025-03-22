/**
 * @deprecated OBSOLETE FILE - DO NOT USE IN NEW CODE
 * This file is kept for reference only during migration to clean architecture.
 * Please use the new implementation in presentation/controllers/container-stats.controller.ts
 */

import { ContainerRepository } from '@modules/containers';
import { ContainerStatsService } from '@modules/containers/obsolete/container-stats.service';
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
  async getNbContainersByStatus(@Param() params: ContainerCountParamDto) {
    try {
      let nbContainers: number;

      if (params.status === 'all') {
        nbContainers = await this.containerRepository.count();
      } else {
        nbContainers = await this.containerRepository.countByStatus(params.status);
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
  async getAveragedStats() {
    try {
      const stats = await this.containerStatsService.getCpuAndMemAveragedStats();
      return stats;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

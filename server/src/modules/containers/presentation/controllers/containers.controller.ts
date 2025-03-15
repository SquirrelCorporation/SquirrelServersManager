import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { ContainerServiceInterface } from '../../application/interfaces/container-service.interface';
import { CONTAINER_SERVICE } from '../../application/interfaces/container-service.interface';
import { Inject } from '@nestjs/common';
import { SSMServicesTypes } from '../../../../types/typings';

@Controller('containers')
@UseGuards(JwtAuthGuard)
export class ContainersController {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: ContainerServiceInterface,
  ) {}

  @Get()
  async getAllContainers() {
    return this.containerService.getAllContainers();
  }

  @Get(':uuid')
  async getContainerByUuid(@Param('uuid') uuid: string) {
    return this.containerService.getContainerByUuid(uuid);
  }

  @Get('device/:deviceUuid')
  async getContainersByDeviceUuid(@Param('deviceUuid') deviceUuid: string) {
    return this.containerService.getContainersByDeviceUuid(deviceUuid);
  }

  @Post('device/:deviceUuid')
  async createContainer(
    @Param('deviceUuid') deviceUuid: string,
    @Body() containerData: SSMServicesTypes.CreateContainerParams,
  ) {
    return this.containerService.createContainer(deviceUuid, containerData);
  }

  @Patch(':uuid')
  async updateContainer(
    @Param('uuid') uuid: string,
    @Body() containerData: Partial<any>,
  ) {
    return this.containerService.updateContainer(uuid, containerData);
  }

  @Delete(':uuid')
  async deleteContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.deleteContainer(uuid) };
  }

  @Post(':uuid/start')
  async startContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.startContainer(uuid) };
  }

  @Post(':uuid/stop')
  async stopContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.stopContainer(uuid) };
  }

  @Post(':uuid/restart')
  async restartContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.restartContainer(uuid) };
  }

  @Post(':uuid/pause')
  async pauseContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.pauseContainer(uuid) };
  }

  @Post(':uuid/unpause')
  async unpauseContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.unpauseContainer(uuid) };
  }

  @Post(':uuid/kill')
  async killContainer(@Param('uuid') uuid: string) {
    return { success: await this.containerService.killContainer(uuid) };
  }

  @Get(':uuid/logs')
  async getContainerLogs(
    @Param('uuid') uuid: string,
    @Query() options: any,
  ) {
    return this.containerService.getContainerLogs(uuid, options);
  }
}
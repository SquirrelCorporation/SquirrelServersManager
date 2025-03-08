import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainerRegistryRepository } from '../repositories/container-registry.repository';
import { ContainerRegistriesService } from '../services/container-registries.service';

@Controller('registries')
@UseGuards(JwtAuthGuard)
export class ContainerRegistriesController {
  constructor(
    private readonly containerRegistriesService: ContainerRegistriesService,
    private readonly containerRegistryRepository: ContainerRegistryRepository
  ) {}

  /**
   * Get all container registries
   */
  @Get()
  async getRegistries(@Res() res) {
    const registries = await this.containerRegistryRepository.findAll();

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Get registries',
      data: {
        registries: registries,
      },
    });
  }

  /**
   * Update registry authentication
   */
  @Post(':name')
  async updateRegistry(@Param('name') name: string, @Body() body: { auth: any }, @Res() res) {
    const containerRegistry = await this.containerRegistryRepository.findOneByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    await this.containerRegistriesService.updateRegistryAuth(containerRegistry, body.auth);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Registry updated',
      data: {},
    });
  }

  /**
   * Create a custom registry
   */
  @Put(':name')
  async createCustomRegistry(
    @Param('name') name: string,
    @Body() body: { auth: any; authScheme: any },
    @Res() res
  ) {
    const containerRegistry = await this.containerRegistryRepository.findOneByName(name);
    if (containerRegistry) {
      throw new HttpException(`Registry already exist with same name: (${name})`, HttpStatus.BAD_REQUEST);
    }

    await this.containerRegistriesService.createCustomRegistry(name, body.auth, body.authScheme);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Registry created',
      data: {},
    });
  }

  /**
   * Reset registry authentication
   */
  @Patch(':name')
  async resetRegistry(@Param('name') name: string, @Res() res) {
    const containerRegistry = await this.containerRegistryRepository.findOneByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    await this.containerRegistriesService.removeRegistryAuth(containerRegistry);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Reset registry',
      data: {},
    });
  }

  /**
   * Remove a custom registry
   */
  @Delete(':name')
  async removeRegistry(@Param('name') name: string, @Res() res) {
    const containerRegistry = await this.containerRegistryRepository.findOneByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    if (containerRegistry.provider !== 'custom') {
      throw new HttpException('You cannot delete a non custom registry provider', HttpStatus.FORBIDDEN);
    }

    await this.containerRegistryRepository.deleteOne(containerRegistry);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Remove registry',
      data: {},
    });
  }
}

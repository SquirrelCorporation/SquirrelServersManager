import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  CONTAINER_REGISTRIES_SERVICE,
  IContainerRegistriesService,
} from '../../domain/interfaces/container-registries-service.interface';
import { CreateCustomRegistryDto, UpdateRegistryAuthDto } from '../dtos/container-registry.dto';

@Controller('container-registries')
export class ContainerRegistriesController {
  constructor(
    @Inject(CONTAINER_REGISTRIES_SERVICE)
    private readonly containerRegistriesService: IContainerRegistriesService,
  ) {}

  /**
   * Get all container registries
   */
  @Get()
  async getRegistries() {
    const registries = await this.containerRegistriesService.getAllRegistries();

    return { registries: registries };
  }

  /**
   * Update registry authentication
   */
  @Post(':name')
  async updateRegistry(@Param('name') name: string, @Body() body: UpdateRegistryAuthDto) {
    const containerRegistry = await this.containerRegistriesService.getRegistryByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    await this.containerRegistriesService.updateRegistryAuth(containerRegistry, body.auth);

    return;
  }

  /**
   * Create a custom registry
   */
  @Put(':name')
  async createCustomRegistry(@Param('name') name: string, @Body() body: CreateCustomRegistryDto) {
    const containerRegistry = await this.containerRegistriesService.getRegistryByName(name);
    if (containerRegistry) {
      throw new HttpException(
        `Registry already exist with same name: (${name})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.containerRegistriesService.createCustomRegistry(name, body.auth, body.authScheme);

    return;
  }

  /**
   * Reset registry authentication
   */
  @Patch(':name')
  async resetRegistry(@Param('name') name: string) {
    const containerRegistry = await this.containerRegistriesService.getRegistryByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    await this.containerRegistriesService.removeRegistryAuth(containerRegistry);

    return;
  }

  /**
   * Remove a custom registry
   */
  @Delete(':name')
  async removeRegistry(@Param('name') name: string) {
    const containerRegistry = await this.containerRegistriesService.getRegistryByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    if (containerRegistry.provider !== 'custom') {
      throw new HttpException(
        'You cannot delete a non custom registry provider',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.containerRegistriesService.deleteRegistry(containerRegistry);

    return;
  }
}

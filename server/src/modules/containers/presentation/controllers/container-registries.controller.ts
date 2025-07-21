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
import { ApiTags } from '@nestjs/swagger';
import {
  CONTAINER_REGISTRIES_SERVICE,
  IContainerRegistriesService,
} from '../../domain/interfaces/container-registries-service.interface';
import { CreateCustomRegistryDto, UpdateRegistryAuthDto } from '../dtos/container-registry.dto';
import {
  CONTAINER_REGISTRIES_TAG,
  CreateCustomRegistryDoc,
  GetRegistriesDoc,
  RemoveRegistryDoc,
  ResetRegistryDoc,
  UpdateRegistryDoc,
} from '../decorators/container-registries.decorators';

/**
 * Container Registries Controller
 *
 * This controller handles operations related to container registries, including
 * fetching, updating, creating, and deleting registries.
 */
@ApiTags(CONTAINER_REGISTRIES_TAG)
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
  @GetRegistriesDoc()
  async getRegistries() {
    const registries = await this.containerRegistriesService.getAllRegistries();
    return { registries: registries };
  }

  /**
   * Update registry authentication
   */
  @Post(':name')
  @UpdateRegistryDoc()
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
  @CreateCustomRegistryDoc()
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
  @ResetRegistryDoc()
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
  @RemoveRegistryDoc()
  async removeRegistry(@Param('name') name: string) {
    const containerRegistry = await this.containerRegistriesService.getRegistryByName(name);
    if (!containerRegistry) {
      throw new HttpException(`Registry not found (${name})`, HttpStatus.NOT_FOUND);
    }

    // TODO: Check if this is correct (or if we should use isCustom) or there is a constant for custom
    if (containerRegistry.provider !== 'custom') {
      throw new HttpException(
        `Cannot delete non-custom registry provider (${name})`,
        HttpStatus.FORBIDDEN,
      );
    }

    await this.containerRegistriesService.deleteRegistry(containerRegistry);

    return;
  }
}

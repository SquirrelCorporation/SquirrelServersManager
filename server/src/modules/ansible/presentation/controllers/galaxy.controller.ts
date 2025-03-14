import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import { GalaxyService } from '../../application/services/galaxy.service';
import { CollectionQueryDto, InstallCollectionDto } from '../dtos/galaxy-collection.dto';
import { CollectionInstallResponseDto, CollectionResponseDto, InstalledCollectionResponseDto } from '../dtos/galaxy-response.dto';

@Controller('ansible/galaxy')
@UseGuards(JwtAuthGuard)
export class GalaxyController {
  constructor(private readonly galaxyService: GalaxyService) {}

  @Get('collections')
  async searchCollections(@Query() queryDto: CollectionQueryDto): Promise<CollectionResponseDto[]> {
    return this.galaxyService.searchCollections(queryDto.query);
  }

  @Get('collections/installed')
  async listInstalledCollections(): Promise<InstalledCollectionResponseDto[]> {
    return this.galaxyService.listInstalledCollections();
  }

  @Post('collections/install')
  async installCollection(@Body() installDto: InstallCollectionDto): Promise<CollectionInstallResponseDto> {
    await this.galaxyService.installCollection(
      installDto.namespace,
      installDto.name,
      installDto.version
    );

    return {
      success: true,
      message: `Collection ${installDto.namespace}.${installDto.name} installed successfully`,
      collection: {
        namespace: installDto.namespace,
        name: installDto.name,
        version: installDto.version
      }
    };
  }
}
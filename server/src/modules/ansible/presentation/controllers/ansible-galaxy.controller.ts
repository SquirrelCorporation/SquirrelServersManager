import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GalaxyService } from '../../application/services/galaxy.service';
import {
  CollectionQueryDto,
  CollectionsQueryDto,
  InstallCollectionDto,
} from '../dtos/galaxy-collection.dto';
import { CollectionsPaginatedResponseDto } from '../dtos/galaxy-response.dto';
import {
  GALAXY_TAG,
  GetCollectionDetailsDoc,
  InstallCollectionDoc,
  SearchCollectionsDoc,
} from '../decorators/galaxy.decorators';

@ApiTags(GALAXY_TAG)
@Controller('ansible/galaxy')
export class GalaxyController {
  constructor(private readonly galaxyService: GalaxyService) {}

  @Get('collections')
  @SearchCollectionsDoc()
  async searchCollections(
    @Query() queryDto: CollectionsQueryDto,
  ): Promise<CollectionsPaginatedResponseDto> {
    const { current, pageSize, namespace, content } = queryDto;
    const offset = (current - 1) * pageSize;

    return this.galaxyService.getAnsibleGalaxyCollections(
      offset,
      pageSize,
      current,
      namespace,
      content,
    );
  }

  @Get('collections/details')
  @GetCollectionDetailsDoc()
  async getCollectionDetails(@Query() queryDto: CollectionQueryDto): Promise<any> {
    const { namespace, name, version } = queryDto;
    return this.galaxyService.getAnsibleGalaxyCollection(namespace, name, version);
  }

  @Post('collections/install')
  @InstallCollectionDoc()
  async installCollection(@Body() installDto: InstallCollectionDto) {
    await this.galaxyService.installCollection(installDto.namespace, installDto.name);
    return;
  }
}

import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { GalaxyService } from '../services/galaxy.service';

@Controller('ansible/galaxy')
@UseGuards(JwtAuthGuard)
export class GalaxyController {
  constructor(private readonly galaxyService: GalaxyService) {}

  @Get('collections')
  async getCollections(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    return this.galaxyService.getCollections(page, pageSize, search);
  }

  @Get('collections/:namespace/:name')
  async getCollection(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Query('version') version?: string,
  ) {
    return this.galaxyService.getCollection(namespace, name, version);
  }

  @Post('collections/install')
  async installCollection(
    @Body() body: { namespace: string; name: string },
  ) {
    return this.galaxyService.installCollection(body.namespace, body.name);
  }
}
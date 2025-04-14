// server/src/infrastructure/plugins/store/plugin-store.controller.ts
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { PluginInfo } from './interfaces/plugin-store-info.interface';
import { PluginStoreService } from './plugin-store.service';

class RepositoryDto {
  @IsUrl({}, { message: 'Invalid URL format.' })
  @IsString()
  url!: string;
}

// DTO for Install endpoint
class InstallPluginDto {
  @IsUrl({}, { message: 'Invalid package URL format.' })
  @IsString()
  packageUrl!: string;

  // Include optional checksum from the PluginInfo
  @IsString()
  @IsOptional()
  checksum?: string;
}

@Controller('plugins/store')
export class PluginStoreController {
  constructor(private readonly pluginStoreService: PluginStoreService) {}

  @Get('repositories')
  async getRepositories(): Promise<string[]> {
    return this.pluginStoreService.getCustomRepositories();
  }

  @Post('repositories')
  @HttpCode(HttpStatus.OK)
  async addRepository(@Body() body: RepositoryDto): Promise<string[]> {
    return this.pluginStoreService.addCustomRepository(body.url);
  }

  @Delete('repositories')
  @HttpCode(HttpStatus.OK)
  async removeRepository(@Body() body: RepositoryDto): Promise<string[]> {
    return this.pluginStoreService.removeCustomRepository(body.url);
  }

  @Get('available')
  async getAvailablePlugins(): Promise<PluginInfo[]> {
    return this.pluginStoreService.getAvailablePlugins();
  }

  // Endpoint to trigger plugin installation
  @Post('install')
  @HttpCode(HttpStatus.OK)
  async installPlugin(@Body() body: InstallPluginDto): Promise<void> {
    // Pass URL and optional checksum directly to the service
    await this.pluginStoreService.installPlugin(body.packageUrl, body.checksum);
  }
}

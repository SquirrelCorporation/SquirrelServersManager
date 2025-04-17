// server/src/infrastructure/plugins/store/plugin-store.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { PluginSystem } from '../plugin-system';
import { PluginStoreInfo } from './interfaces/plugin-store-info.interface';
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

// New base path for installed plugins management?
@Controller('plugins')
export class PluginStoreController {
  constructor(
    private readonly pluginStoreService: PluginStoreService,
    @Inject('PLUGIN_SYSTEM') private readonly pluginSystem: PluginSystem,
  ) {}

  // --- Store Endpoints --- //
  @Get('store/repositories')
  async getRepositories(): Promise<string[]> {
    return this.pluginStoreService.getCustomRepositories();
  }

  @Post('store/repositories')
  @HttpCode(HttpStatus.OK)
  async addRepository(@Body() body: RepositoryDto): Promise<string[]> {
    return this.pluginStoreService.addCustomRepository(body.url);
  }

  @Delete('store/repositories')
  @HttpCode(HttpStatus.OK)
  async removeRepository(@Body() body: RepositoryDto): Promise<string[]> {
    return this.pluginStoreService.removeCustomRepository(body.url);
  }

  @Get('store/available')
  async getAvailablePlugins(): Promise<PluginStoreInfo[]> {
    return this.pluginStoreService.getAvailablePlugins();
  }

  // Endpoint to trigger plugin installation
  @Post('store/install')
  @HttpCode(HttpStatus.OK)
  async installPlugin(@Body() body: InstallPluginDto): Promise<void> {
    // Pass URL and optional checksum directly to the service
    await this.pluginStoreService.installPlugin(body.packageUrl, body.checksum);
  }

  // --- Installed Plugin Endpoint --- //
  @Delete('installed/:pluginId')
  @HttpCode(HttpStatus.OK) // Or maybe 204 No Content?
  async uninstallPlugin(@Param('pluginId') pluginId: string): Promise<void> {
    // We use pluginSystem directly here as uninstall logic is in the core system
    await this.pluginSystem.uninstallPlugin(pluginId);
    // Note: A server restart might be needed for full effect
  }
}

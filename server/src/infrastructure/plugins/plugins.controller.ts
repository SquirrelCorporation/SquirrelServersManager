import { Controller, Get, Inject } from '@nestjs/common';
import { PluginManifest, PluginSystem } from './plugin-system';

@Controller('plugins')
export class PluginsController {
  constructor(@Inject('PLUGIN_SYSTEM') private readonly pluginSystem: PluginSystem) {}

  @Get()
  getPlugins(): PluginManifest[] {
    return this.pluginSystem.getPluginManifests();
  }
}

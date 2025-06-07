import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PluginManifest, PluginSystem } from './plugin-system';
import { GetPluginsDoc } from './decorators/plugins.decorators';
import { PLUGINS_TAG } from './decorators/plugins.decorators';

@ApiTags(PLUGINS_TAG)
@Controller('plugins')
export class PluginsController {
  constructor(@Inject('PLUGIN_SYSTEM') private readonly pluginSystem: PluginSystem) {}

  @Get()
  @GetPluginsDoc()
  getPlugins(): PluginManifest[] {
    return this.pluginSystem.getPluginManifests();
  }
}

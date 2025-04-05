import { Module } from '@nestjs/common';
import { PluginModule } from './plugin-system';
import { PluginsController } from './plugins.controller';

@Module({
  imports: [PluginModule.forRoot()],
  controllers: [PluginsController],
})
export class PluginsModule {}

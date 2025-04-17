import { Module } from '@nestjs/common';
import { PluginModule } from './plugin-system';
import { PluginsController } from './plugins.controller';
import { PluginStoreModule } from './store/plugin-store.module';

@Module({
  imports: [PluginModule.forRoot(), PluginStoreModule],
  controllers: [PluginsController],
  providers: [],
})
export class PluginsModule {}

// server/src/infrastructure/plugins/store/plugin-store.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PluginStoreController } from './plugin-store.controller';
import { PluginStoreService } from './plugin-store.service';
import { PluginStoreConfig, PluginStoreConfigSchema } from './schemas/plugin-store-config.schema';
// Assuming AdminGuard is provided globally or via an imported AuthModule
// If not, AuthModule might need to be imported here as well.

@Module({
  imports: [
    ConfigModule, // Make ConfigService available to PluginStoreService
    MongooseModule.forFeature([{ name: PluginStoreConfig.name, schema: PluginStoreConfigSchema }]),
    // Import AuthModule if AdminGuard is provided there and not globally
    // Example: AuthModule,
  ],
  controllers: [PluginStoreController],
  providers: [PluginStoreService],
})
export class PluginStoreModule {}

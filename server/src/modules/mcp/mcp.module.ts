import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from '@modules/users/users.module';
import { McpTransportService } from './infrastructure/transport/mcp-transport.service';
import { McpHandlerRegistryService } from './application/services/mcp-handler-registry.service';
import { McpNotificationService } from './application/services/mcp-notification.service';
import { McpSettingsController } from './presentation/controllers/mcp-settings.controller';

@Module({})
export class McpModule {
  static registerAsync(): DynamicModule {
    return {
      module: McpModule,
      imports: [
        UsersModule,
        ConfigModule,
        ClientsModule.registerAsync([
          {
            name: 'CORE_SERVICE_CLIENT',
            imports: [ConfigModule],
            useFactory: () => {
              return {
                transport: Transport.TCP,
                options: {
                  host: 'localhost',
                  port: 3002,
                },
              };
            },
          },
        ]),
      ],
      providers: [McpHandlerRegistryService, McpNotificationService, McpTransportService],
      controllers: [McpSettingsController],
      exports: [],
    };
  }
}

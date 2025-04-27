import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from '@modules/users/users.module';
import { McpTransportService } from './infrastructure/transport/mcp-transport.service';
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
            useFactory: (configService: ConfigService) => {
              const coreServicePort = configService.get<number>('CORE_SERVICE_PORT') || 3002;
              return {
                transport: Transport.TCP,
                options: {
                  host: 'localhost',
                  port: coreServicePort,
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [McpTransportService],
      controllers: [McpSettingsController],
      exports: [],
    };
  }
}

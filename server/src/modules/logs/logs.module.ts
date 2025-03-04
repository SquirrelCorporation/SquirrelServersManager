import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './controllers/logs.controller';
import { ServerLogsRepository } from './repositories/server-logs.repository';
import { ServerLog, ServerLogSchema } from './schemas/server-log.schema';
import { ServerLogsService } from './services/server-logs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServerLog.name, schema: ServerLogSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [
    ServerLogsService,
    ServerLogsRepository,
  ],
  exports: [
    ServerLogsService,
    ServerLogsRepository,
  ],
})
export class LogsModule {}

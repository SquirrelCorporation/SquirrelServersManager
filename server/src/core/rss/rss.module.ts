import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RSSController } from './presentation/rss.controller';
import { RSSService } from './application/rss.service';
import { RSSRepository } from './infrastructure/adapters/rss.repository';
import { RSS_REPOSITORY } from './constants/injection-tokens';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [RSSController],
  providers: [
    RSSService,
    {
      provide: RSS_REPOSITORY,
      useClass: RSSRepository,
    },
  ],
  exports: [RSSService],
})
export class RSSModule {}
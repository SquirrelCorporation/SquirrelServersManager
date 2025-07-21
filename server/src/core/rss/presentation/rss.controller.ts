import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/infrastructure/auth/strategies/jwt-auth.guard';
import { RSSService } from '../application/rss.service';
import { FetchFeedsDto, RSSFeedItemDto } from './rss.dto';
import { Logger } from '@nestjs/common';

@ApiTags('RSS Feeds')
@Controller('rss')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RSSController {
  private readonly logger = new Logger(RSSController.name);

  constructor(private readonly rssService: RSSService) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Fetch RSS feeds based on provided configurations' })
  @ApiResponse({ 
    status: 200, 
    description: 'RSS feed items fetched successfully',
    type: [RSSFeedItemDto]
  })
  async fetchFeeds(@Body() fetchFeedsDto: FetchFeedsDto): Promise<RSSFeedItemDto[]> {
    this.logger.log(`Fetching ${fetchFeedsDto.feeds.length} RSS feeds`);
    return this.rssService.fetchFeeds(fetchFeedsDto.feeds);
  }

  @Get('fetch-single')
  @ApiOperation({ summary: 'Fetch a single RSS feed by URL' })
  @ApiResponse({ 
    status: 200, 
    description: 'RSS feed items fetched successfully',
    type: [RSSFeedItemDto]
  })
  async fetchSingleFeed(@Query('url') url: string): Promise<RSSFeedItemDto[]> {
    this.logger.log(`Fetching single RSS feed from: ${url}`);
    return this.rssService.fetchSingleFeed(url);
  }
}
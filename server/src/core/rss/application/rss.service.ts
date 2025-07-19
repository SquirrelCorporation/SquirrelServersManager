import { Injectable, Logger, Inject } from '@nestjs/common';
import { IRSSRepository } from '../domain/rss.repository.interface';
import { RSSFeedItem, FeedConfig } from '../domain/feed.entity';
import { RSS_REPOSITORY } from '../constants/injection-tokens';

@Injectable()
export class RSSService {
  private readonly logger = new Logger(RSSService.name);

  constructor(@Inject(RSS_REPOSITORY) private readonly rssRepository: IRSSRepository) {}

  async fetchFeeds(feedConfigs: FeedConfig[]): Promise<RSSFeedItem[]> {
    try {
      const enabledFeeds = feedConfigs.filter(feed => feed.enabled);
      const feedUrls = enabledFeeds.map(feed => feed.url);
      
      if (feedUrls.length === 0) {
        return [];
      }

      const feeds = await this.rssRepository.fetchMultipleFeeds(feedUrls);
      
      // Combine all items from all feeds
      const allItems: RSSFeedItem[] = [];
      
      feeds.forEach((feed, index) => {
        const config = enabledFeeds[index];
        feed.items.forEach(item => {
          allItems.push({
            ...item,
            source: config.name
          });
        });
      });

      // Sort by publication date (newest first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
      });

      // Return limited number of items
      return allItems.slice(0, 50);
    } catch (error) {
      this.logger.error('Failed to fetch RSS feeds', error);
      throw error;
    }
  }

  async fetchSingleFeed(url: string): Promise<RSSFeedItem[]> {
    try {
      const feed = await this.rssRepository.fetchFeed(url);
      return feed.items;
    } catch (error) {
      this.logger.error(`Failed to fetch RSS feed from ${url}`, error);
      throw error;
    }
  }
}
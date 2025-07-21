import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Parser from 'rss-parser';
import { IRSSRepository } from '../../domain/rss.repository.interface';
import { RSS_REPOSITORY } from '../../constants/injection-tokens';
import { RSSFeed, RSSFeedItem } from '../../domain/feed.entity';

@Injectable()
export class RSSRepository implements IRSSRepository {
  private readonly logger = new Logger(RSSRepository.name);
  private readonly parser: Parser;

  constructor(private readonly httpService: HttpService) {
    this.parser = new Parser({
      customFields: {
        item: [
          ['author', 'author'],
          ['category', 'category', { keepArray: true }],
        ]
      }
    });
  }

  async fetchFeed(url: string): Promise<RSSFeed> {
    try {
      // For some RSS feeds, we might need to fetch with specific headers
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'SquirrelServersManager/1.0 RSS Reader',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          },
          timeout: 10000, // 10 second timeout
        })
      );

      const feed = await this.parser.parseString(response.data);
      
      const items: RSSFeedItem[] = feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        description: item.contentSnippet || item.content || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.title || 'Unknown',
        guid: item.guid || item.link,
        author: item.author || item.creator,
        category: Array.isArray(item.categories) ? item.categories : []
      }));

      return {
        title: feed.title || '',
        link: feed.link || '',
        description: feed.description || '',
        lastBuildDate: feed.lastBuildDate,
        items: items.slice(0, 20) // Limit items per feed
      };
    } catch (error) {
      this.logger.error(`Failed to fetch RSS feed from ${url}`, error);
      throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async fetchMultipleFeeds(urls: string[]): Promise<RSSFeed[]> {
    const feedPromises = urls.map(url => 
      this.fetchFeed(url).catch(error => {
        this.logger.error(`Failed to fetch feed from ${url}`, error);
        // Return empty feed on error to continue with other feeds
        return {
          title: 'Error',
          link: url,
          description: `Failed to fetch feed: ${error instanceof Error ? error.message : String(error)}`,
          items: []
        };
      })
    );

    return Promise.all(feedPromises);
  }
}
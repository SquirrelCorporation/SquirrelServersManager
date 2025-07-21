import { RSSFeed } from './feed.entity';

export interface IRSSRepository {
  fetchFeed(url: string): Promise<RSSFeed>;
  fetchMultipleFeeds(urls: string[]): Promise<RSSFeed[]>;
}
export interface RSSFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  guid?: string;
  author?: string;
  category?: string[];
}

export interface RSSFeed {
  title: string;
  link: string;
  description: string;
  lastBuildDate?: string;
  items: RSSFeedItem[];
}

export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}
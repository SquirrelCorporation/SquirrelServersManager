import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

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

export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface FetchFeedsRequest {
  feeds: FeedConfig[];
}

const BASE_URL = '/api/rss';

export async function fetchRSSFeeds(feeds: FeedConfig[]): Promise<API.Response<RSSFeedItem[]>> {
  return request<API.Response<RSSFeedItem[]>>(`${BASE_URL}/fetch`, {
    method: 'POST',
    data: { feeds }
  });
}

export async function fetchSingleRSSFeed(url: string): Promise<API.Response<RSSFeedItem[]>> {
  return request<API.Response<RSSFeedItem[]>>(`${BASE_URL}/fetch-single`, {
    method: 'GET',
    params: { url }
  });
}
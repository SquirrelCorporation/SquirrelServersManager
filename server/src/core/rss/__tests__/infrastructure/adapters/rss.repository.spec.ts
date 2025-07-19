import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { RSSRepository } from '../../../infrastructure/adapters/rss.repository';
import { RSSFeed, RSSFeedItem } from '../../../domain/feed.entity';
import Parser from 'rss-parser';

// Mock logger
vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

describe('RSSRepository', () => {
  let repository: RSSRepository;
  let httpService: HttpService;
  let mockParser: any;

  // Mock data
  const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Test RSS Feed</title>
        <link>https://example.com</link>
        <description>Test Description</description>
        <lastBuildDate>Mon, 15 Jan 2024 10:00:00 GMT</lastBuildDate>
        <item>
          <title>Test Article 1</title>
          <link>https://example.com/article1</link>
          <description>Article 1 description</description>
          <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
          <guid>https://example.com/article1</guid>
          <author>test@example.com</author>
          <category>Technology</category>
        </item>
      </channel>
    </rss>`;

  const mockParsedFeed = {
    title: 'Test RSS Feed',
    link: 'https://example.com',
    description: 'Test Description',
    lastBuildDate: 'Mon, 15 Jan 2024 10:00:00 GMT',
    items: [
      {
        title: 'Test Article 1',
        link: 'https://example.com/article1',
        contentSnippet: 'Article 1 description',
        pubDate: 'Mon, 15 Jan 2024 10:00:00 GMT',
        guid: 'https://example.com/article1',
        author: 'test@example.com',
        categories: ['Technology'],
      },
      {
        title: 'Test Article 2',
        link: 'https://example.com/article2',
        content: 'Article 2 full content',
        isoDate: '2024-01-14T15:00:00Z',
        creator: 'author2',
      },
    ],
  };

  const mockAxiosResponse: AxiosResponse = {
    data: mockRssXml,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    // Create mock HttpService
    httpService = {
      get: vi.fn(),
    } as any;

    // Create mock parser
    mockParser = {
      parseString: vi.fn(),
    };

    // Manually create the repository instance with mocked dependencies
    repository = new RSSRepository(httpService);
    
    // Replace the parser with our mock
    (repository as any).parser = mockParser;
  });

  describe('fetchFeed', () => {
    it('should successfully fetch and parse an RSS feed', async () => {
      // Arrange
      const url = 'https://example.com/feed.xml';
      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockResolvedValue(mockParsedFeed);

      // Act
      const result = await repository.fetchFeed(url);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': 'SquirrelServersManager/1.0 RSS Reader',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        timeout: 10000,
      });
      expect(mockParser.parseString).toHaveBeenCalledWith(mockRssXml);
      expect(result).toEqual({
        title: 'Test RSS Feed',
        link: 'https://example.com',
        description: 'Test Description',
        lastBuildDate: 'Mon, 15 Jan 2024 10:00:00 GMT',
        items: [
          {
            title: 'Test Article 1',
            link: 'https://example.com/article1',
            description: 'Article 1 description',
            pubDate: 'Mon, 15 Jan 2024 10:00:00 GMT',
            source: 'Test RSS Feed',
            guid: 'https://example.com/article1',
            author: 'test@example.com',
            category: ['Technology'],
          },
          {
            title: 'Test Article 2',
            link: 'https://example.com/article2',
            description: 'Article 2 full content',
            pubDate: '2024-01-14T15:00:00Z',
            source: 'Test RSS Feed',
            guid: 'https://example.com/article2',
            author: 'author2',
            category: [],
          },
        ],
      });
    });

    it('should handle feeds with missing optional fields', async () => {
      // Arrange
      const minimalParsedFeed = {
        items: [
          {
            title: null,
            link: null,
            description: null,
          },
        ],
      };

      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockResolvedValue(minimalParsedFeed);

      // Act
      const result = await repository.fetchFeed('https://example.com/feed.xml');

      // Assert
      expect(result.items[0]).toEqual({
        title: '',
        link: '',
        description: '',
        pubDate: expect.any(String), // Should use current date
        source: 'Unknown',
        guid: null,
        author: undefined,
        category: [],
      });
    });

    it('should limit items to 20 per feed', async () => {
      // Arrange
      const feedWithManyItems = {
        ...mockParsedFeed,
        items: Array(30).fill(null).map((_, i) => ({
          title: `Article ${i}`,
          link: `https://example.com/article${i}`,
        })),
      };

      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockResolvedValue(feedWithManyItems);

      // Act
      const result = await repository.fetchFeed('https://example.com/feed.xml');

      // Assert
      expect(result.items).toHaveLength(20);
    });

    it('should handle HTTP errors', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(httpService.get).mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(repository.fetchFeed('https://example.com/feed.xml')).rejects.toThrow(
        'Failed to fetch RSS feed: Network error'
      );
    });

    it('should handle parser errors', async () => {
      // Arrange
      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockRejectedValue(new Error('Invalid XML'));

      // Act & Assert
      await expect(repository.fetchFeed('https://example.com/feed.xml')).rejects.toThrow(
        'Failed to fetch RSS feed: Invalid XML'
      );
    });

    it('should use content when contentSnippet is not available', async () => {
      // Arrange
      const feedWithContent = {
        ...mockParsedFeed,
        items: [
          {
            title: 'Test',
            link: 'https://example.com/test',
            content: 'Full content here',
            contentSnippet: null,
          },
        ],
      };

      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockResolvedValue(feedWithContent);

      // Act
      const result = await repository.fetchFeed('https://example.com/feed.xml');

      // Assert
      expect(result.items[0].description).toBe('Full content here');
    });

    it('should handle both author and creator fields', async () => {
      // Arrange
      const feedWithCreator = {
        items: [
          {
            title: 'Test',
            link: 'https://example.com/test',
            creator: 'Creator Name',
          },
        ],
      };

      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockResolvedValue(feedWithCreator);

      // Act
      const result = await repository.fetchFeed('https://example.com/feed.xml');

      // Assert
      expect(result.items[0].author).toBe('Creator Name');
    });
  });

  describe('fetchMultipleFeeds', () => {
    it('should fetch multiple feeds successfully', async () => {
      // Arrange
      const urls = ['https://feed1.com/rss', 'https://feed2.com/rss'];
      vi.mocked(httpService.get).mockReturnValue(of(mockAxiosResponse));
      mockParser.parseString.mockResolvedValue(mockParsedFeed);

      // Act
      const result = await repository.fetchMultipleFeeds(urls);

      // Assert
      expect(result).toHaveLength(2);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should continue fetching other feeds when one fails', async () => {
      // Arrange
      const urls = ['https://feed1.com/rss', 'https://feed2.com/rss', 'https://feed3.com/rss'];
      
      // First call succeeds
      vi.mocked(httpService.get)
        .mockReturnValueOnce(of(mockAxiosResponse))
        // Second call fails
        .mockReturnValueOnce(throwError(() => new Error('Network error')))
        // Third call succeeds
        .mockReturnValueOnce(of(mockAxiosResponse));
      
      mockParser.parseString.mockResolvedValue(mockParsedFeed);

      // Act
      const result = await repository.fetchMultipleFeeds(urls);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Test RSS Feed');
      expect(result[1].title).toBe('Error');
      expect(result[1].description).toContain('Failed to fetch feed');
      expect(result[1].items).toEqual([]);
      expect(result[2].title).toBe('Test RSS Feed');
    });

    it('should handle empty URL array', async () => {
      // Act
      const result = await repository.fetchMultipleFeeds([]);

      // Assert
      expect(result).toEqual([]);
      expect(httpService.get).not.toHaveBeenCalled();
    });
  });
});
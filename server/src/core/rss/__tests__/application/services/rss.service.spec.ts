import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { RSSService } from '../../../application/rss.service';
import { RSS_REPOSITORY } from '../../../constants/injection-tokens';
import { IRSSRepository } from '../../../domain/rss.repository.interface';
import { RSSFeed, RSSFeedItem, FeedConfig } from '../../../domain/feed.entity';

describe('RSSService', () => {
  let service: RSSService;
  let rssRepository: IRSSRepository;

  // Mock data
  const mockFeedConfig1: FeedConfig = {
    id: 'feed-1',
    name: 'Docker Blog',
    url: 'https://www.docker.com/blog/feed/',
    enabled: true,
  };

  const mockFeedConfig2: FeedConfig = {
    id: 'feed-2',
    name: 'Kubernetes Blog',
    url: 'https://kubernetes.io/feed.xml',
    enabled: true,
  };

  const mockFeedConfig3: FeedConfig = {
    id: 'feed-3',
    name: 'Disabled Feed',
    url: 'https://disabled.com/feed/',
    enabled: false,
  };

  const mockRSSFeed1: RSSFeed = {
    title: 'Docker Blog',
    link: 'https://www.docker.com/blog',
    description: 'Docker Blog',
    lastBuildDate: '2024-01-15T10:00:00Z',
    items: [
      {
        title: 'Docker Desktop Update',
        link: 'https://www.docker.com/blog/docker-desktop-update',
        description: 'New features in Docker Desktop',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'Docker Blog',
      },
      {
        title: 'Container Security Best Practices',
        link: 'https://www.docker.com/blog/security-best-practices',
        description: 'Learn about container security',
        pubDate: '2024-01-14T15:00:00Z',
        source: 'Docker Blog',
      },
    ],
  };

  const mockRSSFeed2: RSSFeed = {
    title: 'Kubernetes Blog',
    link: 'https://kubernetes.io/blog',
    description: 'Kubernetes Blog',
    lastBuildDate: '2024-01-15T12:00:00Z',
    items: [
      {
        title: 'Kubernetes 1.29 Released',
        link: 'https://kubernetes.io/blog/k8s-1-29',
        description: 'New features in Kubernetes 1.29',
        pubDate: '2024-01-15T12:00:00Z',
        source: 'Kubernetes Blog',
      },
    ],
  };

  beforeEach(async () => {
    // Create mock repository
    const mockRssRepository: Partial<IRSSRepository> = {
      fetchFeed: vi.fn(),
      fetchMultipleFeeds: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        RSSService,
        {
          provide: RSS_REPOSITORY,
          useValue: mockRssRepository,
        },
      ],
    }).compile();

    service = module.get<RSSService>(RSSService);
    rssRepository = module.get<IRSSRepository>(RSS_REPOSITORY);

    // Spy on logger to suppress output during tests
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  describe('fetchFeeds', () => {
    it('should fetch and combine feeds from enabled sources', async () => {
      // Arrange
      const feedConfigs = [mockFeedConfig1, mockFeedConfig2, mockFeedConfig3];
      vi.mocked(rssRepository.fetchMultipleFeeds).mockResolvedValue([
        mockRSSFeed1,
        mockRSSFeed2,
      ]);

      // Act
      const result = await service.fetchFeeds(feedConfigs);

      // Assert
      expect(rssRepository.fetchMultipleFeeds).toHaveBeenCalledWith([
        mockFeedConfig1.url,
        mockFeedConfig2.url,
      ]);
      expect(result).toHaveLength(3);
      expect(result[0].source).toBe('Kubernetes Blog'); // Should be sorted by date (newest first)
      expect(result[1].source).toBe('Docker Blog');
      expect(result[2].source).toBe('Docker Blog');
    });

    it('should return empty array when no feeds are enabled', async () => {
      // Arrange
      const feedConfigs = [mockFeedConfig3]; // Only disabled feed

      // Act
      const result = await service.fetchFeeds(feedConfigs);

      // Assert
      expect(rssRepository.fetchMultipleFeeds).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array when feedConfigs is empty', async () => {
      // Act
      const result = await service.fetchFeeds([]);

      // Assert
      expect(rssRepository.fetchMultipleFeeds).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should limit the number of returned items to 50', async () => {
      // Arrange
      const mockFeedWithManyItems: RSSFeed = {
        ...mockRSSFeed1,
        items: Array(60).fill(null).map((_, index) => ({
          title: `Item ${index}`,
          link: `https://example.com/item-${index}`,
          description: `Description ${index}`,
          pubDate: new Date(Date.now() - index * 1000).toISOString(),
          source: 'Test Feed',
        })),
      };

      vi.mocked(rssRepository.fetchMultipleFeeds).mockResolvedValue([mockFeedWithManyItems]);

      // Act
      const result = await service.fetchFeeds([mockFeedConfig1]);

      // Assert
      expect(result).toHaveLength(50);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(rssRepository.fetchMultipleFeeds).mockRejectedValue(error);

      // Act & Assert
      await expect(service.fetchFeeds([mockFeedConfig1])).rejects.toThrow('Network error');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to fetch RSS feeds',
        error
      );
    });

    it('should properly assign source names from feed configs', async () => {
      // Arrange
      const feedWithoutSource: RSSFeed = {
        ...mockRSSFeed1,
        items: [
          {
            title: 'Test Item',
            link: 'https://example.com/test',
            description: 'Test description',
            pubDate: '2024-01-15T10:00:00Z',
            source: '', // Empty source
          },
        ],
      };

      vi.mocked(rssRepository.fetchMultipleFeeds).mockResolvedValue([feedWithoutSource]);

      // Act
      const result = await service.fetchFeeds([mockFeedConfig1]);

      // Assert
      expect(result[0].source).toBe('Docker Blog'); // Should use config name
    });
  });

  describe('fetchSingleFeed', () => {
    it('should fetch items from a single feed URL', async () => {
      // Arrange
      const url = 'https://example.com/feed.xml';
      vi.mocked(rssRepository.fetchFeed).mockResolvedValue(mockRSSFeed1);

      // Act
      const result = await service.fetchSingleFeed(url);

      // Assert
      expect(rssRepository.fetchFeed).toHaveBeenCalledWith(url);
      expect(result).toEqual(mockRSSFeed1.items);
    });

    it('should handle repository errors for single feed', async () => {
      // Arrange
      const url = 'https://example.com/feed.xml';
      const error = new Error('Invalid RSS format');
      vi.mocked(rssRepository.fetchFeed).mockRejectedValue(error);

      // Act & Assert
      await expect(service.fetchSingleFeed(url)).rejects.toThrow('Invalid RSS format');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Failed to fetch RSS feed from ${url}`,
        error
      );
    });

    it('should return empty items array when feed has no items', async () => {
      // Arrange
      const url = 'https://example.com/feed.xml';
      const emptyFeed: RSSFeed = {
        ...mockRSSFeed1,
        items: [],
      };
      vi.mocked(rssRepository.fetchFeed).mockResolvedValue(emptyFeed);

      // Act
      const result = await service.fetchSingleFeed(url);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
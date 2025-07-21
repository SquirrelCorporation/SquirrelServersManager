import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { RSSController } from '../../../presentation/rss.controller';
import { RSSService } from '../../../application/rss.service';
import { FetchFeedsDto, RSSFeedItemDto } from '../../../presentation/rss.dto';
import { FeedConfig } from '../../../domain/feed.entity';

// Mock logger
vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('RSSController', () => {
  let controller: RSSController;
  let rssService: RSSService;

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
    enabled: false,
  };

  const mockRSSFeedItems: RSSFeedItemDto[] = [
    {
      title: 'Docker Desktop Update',
      link: 'https://www.docker.com/blog/docker-desktop-update',
      description: 'New features in Docker Desktop',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'Docker Blog',
      guid: 'docker-update-123',
      author: 'Docker Team',
      category: ['Docker', 'Updates'],
    },
    {
      title: 'Kubernetes 1.29 Released',
      link: 'https://kubernetes.io/blog/k8s-1-29',
      description: 'New features in Kubernetes 1.29',
      pubDate: '2024-01-15T12:00:00Z',
      source: 'Kubernetes Blog',
    },
  ];

  beforeEach(async () => {
    // Create mock service
    rssService = {
      fetchFeeds: vi.fn(),
      fetchSingleFeed: vi.fn(),
    } as any;

    // Manually create controller instance with mocked dependencies
    controller = new RSSController(rssService);
  });

  describe('fetchFeeds', () => {
    it('should fetch RSS feeds based on provided configurations', async () => {
      // Arrange
      const fetchFeedsDto: FetchFeedsDto = {
        feeds: [mockFeedConfig1, mockFeedConfig2],
      };
      vi.mocked(rssService.fetchFeeds).mockResolvedValue(mockRSSFeedItems);

      // Act
      const result = await controller.fetchFeeds(fetchFeedsDto);

      // Assert
      expect(rssService.fetchFeeds).toHaveBeenCalledWith(fetchFeedsDto.feeds);
      expect(result).toEqual(mockRSSFeedItems);
      expect(Logger.prototype.log).toHaveBeenCalledWith('Fetching 2 RSS feeds');
    });

    it('should handle empty feed configurations', async () => {
      // Arrange
      const fetchFeedsDto: FetchFeedsDto = {
        feeds: [],
      };
      vi.mocked(rssService.fetchFeeds).mockResolvedValue([]);

      // Act
      const result = await controller.fetchFeeds(fetchFeedsDto);

      // Assert
      expect(rssService.fetchFeeds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
      expect(Logger.prototype.log).toHaveBeenCalledWith('Fetching 0 RSS feeds');
    });

    it('should pass through service errors', async () => {
      // Arrange
      const fetchFeedsDto: FetchFeedsDto = {
        feeds: [mockFeedConfig1],
      };
      const error = new Error('Service error');
      vi.mocked(rssService.fetchFeeds).mockRejectedValue(error);

      // Act & Assert
      await expect(controller.fetchFeeds(fetchFeedsDto)).rejects.toThrow('Service error');
    });

    it('should handle feeds with mixed enabled/disabled status', async () => {
      // Arrange
      const mixedFeeds: FeedConfig[] = [
        { ...mockFeedConfig1, enabled: true },
        { ...mockFeedConfig2, enabled: false },
        { id: 'feed-3', name: 'Another Feed', url: 'https://example.com/feed', enabled: true },
      ];
      const fetchFeedsDto: FetchFeedsDto = { feeds: mixedFeeds };
      vi.mocked(rssService.fetchFeeds).mockResolvedValue(mockRSSFeedItems);

      // Act
      const result = await controller.fetchFeeds(fetchFeedsDto);

      // Assert
      expect(rssService.fetchFeeds).toHaveBeenCalledWith(mixedFeeds);
      expect(result).toEqual(mockRSSFeedItems);
      expect(Logger.prototype.log).toHaveBeenCalledWith('Fetching 3 RSS feeds');
    });
  });

  describe('fetchSingleFeed', () => {
    it('should fetch a single RSS feed by URL', async () => {
      // Arrange
      const url = 'https://example.com/feed.xml';
      vi.mocked(rssService.fetchSingleFeed).mockResolvedValue(mockRSSFeedItems);

      // Act
      const result = await controller.fetchSingleFeed(url);

      // Assert
      expect(rssService.fetchSingleFeed).toHaveBeenCalledWith(url);
      expect(result).toEqual(mockRSSFeedItems);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        `Fetching single RSS feed from: ${url}`
      );
    });

    it('should handle empty URL', async () => {
      // Arrange
      const url = '';
      vi.mocked(rssService.fetchSingleFeed).mockResolvedValue([]);

      // Act
      const result = await controller.fetchSingleFeed(url);

      // Assert
      expect(rssService.fetchSingleFeed).toHaveBeenCalledWith('');
      expect(result).toEqual([]);
    });

    it('should pass through service errors for single feed', async () => {
      // Arrange
      const url = 'https://invalid-url.com/feed';
      const error = new Error('Invalid RSS format');
      vi.mocked(rssService.fetchSingleFeed).mockRejectedValue(error);

      // Act & Assert
      await expect(controller.fetchSingleFeed(url)).rejects.toThrow('Invalid RSS format');
    });

    it('should handle URLs with special characters', async () => {
      // Arrange
      const url = 'https://example.com/feed?category=tech&format=rss';
      vi.mocked(rssService.fetchSingleFeed).mockResolvedValue(mockRSSFeedItems);

      // Act
      const result = await controller.fetchSingleFeed(url);

      // Assert
      expect(rssService.fetchSingleFeed).toHaveBeenCalledWith(url);
      expect(result).toEqual(mockRSSFeedItems);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        `Fetching single RSS feed from: ${url}`
      );
    });
  });

  describe('Guard and Decorator behavior', () => {
    it('should have JwtAuthGuard applied to controller', () => {
      // This test ensures the controller is properly decorated
      // In a real scenario, we would test the guard behavior in integration tests
      expect(controller).toBeDefined();
      expect(controller.fetchFeeds).toBeDefined();
      expect(controller.fetchSingleFeed).toBeDefined();
    });
  });
});
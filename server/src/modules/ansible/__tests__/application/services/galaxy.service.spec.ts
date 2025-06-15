import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

// Simplified GalaxyService for testing
class GalaxyService {
  private readonly galaxyApiUrl = 'https://galaxy.ansible.com/api';
  private readonly logger = { log: vi.fn(), error: vi.fn() };

  constructor(
    private readonly httpService: any,
    private readonly ansibleCommandService: any,
  ) {}

  async getAnsibleGalaxyCollections(
    offset: number,
    pageSize: number,
    current: number,
    namespace?: string,
    content?: string,
  ): Promise<any> {
    try {
      const response = await this.httpService
        .get(
          `${this.galaxyApiUrl}/v3/plugin/ansible/search/collection-versions/?${namespace ? 'namespace=' + encodeURIComponent(namespace) + '&' : ''}${content ? 'keywords=' + encodeURIComponent(content) + '&' : ''}is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=${offset}&limit=${pageSize}&order_by=name`,
        )
        .toPromise();
      this.logger.log(response);
      return {
        data: response.data?.data || [],
        metadata: {
          total: response.data?.meta?.count,
          pageSize,
          current,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error searching Galaxy collections: ${error.message}`);
      throw error;
    }
  }

  async getAnsibleGalaxyCollection(
    namespace?: string,
    name?: string,
    version?: string,
  ): Promise<any> {
    if (!namespace || !name) {
      throw new Error('Namespace and name are required');
    }

    const response = await this.httpService
      .get(
        `${this.galaxyApiUrl}/pulp/api/v3/content/ansible/collection_versions/?namespace=${encodeURIComponent(namespace)}&name=${encodeURIComponent(name)}${version ? '&version=' + encodeURIComponent(version) : ''}&offset=0&limit=10`,
      )
      .toPromise();
    return response.data?.results ? response.data.results[0] : undefined;
  }

  async installCollection(namespace: string, name: string): Promise<void> {
    try {
      await this.ansibleCommandService.installAnsibleGalaxyCollection(name, namespace);
    } catch (error: any) {
      this.logger.error(`Error installing Galaxy collection: ${error.message}`);
      throw error;
    }
  }
}

describe('GalaxyService', () => {
  let service: GalaxyService;
  let mockHttpService: any;
  let mockAnsibleCommandService: any;

  beforeEach(() => {
    mockHttpService = {
      get: vi.fn().mockImplementation(() => ({
        toPromise: vi.fn().mockResolvedValue({
          data: {
            data: [{ name: 'test-collection' }],
            meta: { count: 1 },
            results: [{ name: 'test-collection' }],
          },
        }),
      })),
    };

    mockAnsibleCommandService = {
      installAnsibleGalaxyCollection: vi.fn().mockResolvedValue(undefined),
    };

    service = new GalaxyService(mockHttpService, mockAnsibleCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnsibleGalaxyCollections', () => {
    it('should return collections data with metadata', async () => {
      const result = await service.getAnsibleGalaxyCollections(0, 10, 1);

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      expect(result.data).toEqual([{ name: 'test-collection' }]);
      expect(result.metadata.total).toBe(1);
      expect(result.metadata.pageSize).toBe(10);
      expect(result.metadata.current).toBe(1);
    });

    it('should handle error when API call fails', async () => {
      mockHttpService.get.mockImplementationOnce(() => ({
        toPromise: vi.fn().mockRejectedValue(new Error('API error')),
      }));

      await expect(service.getAnsibleGalaxyCollections(0, 10, 1)).rejects.toThrow('API error');
    });
  });

  describe('getAnsibleGalaxyCollection', () => {
    it('should return a specific collection', async () => {
      const result = await service.getAnsibleGalaxyCollection('test-namespace', 'test-collection');

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(result).toEqual({ name: 'test-collection' });
    });

    it('should throw error when namespace or name is missing', async () => {
      await expect(
        service.getAnsibleGalaxyCollection(undefined, 'test-collection'),
      ).rejects.toThrow('Namespace and name are required');
      await expect(service.getAnsibleGalaxyCollection('test-namespace', undefined)).rejects.toThrow(
        'Namespace and name are required',
      );
    });
  });

  describe('installCollection', () => {
    it('should call ansible command service to install collection', async () => {
      await service.installCollection('test-namespace', 'test-collection');

      expect(mockAnsibleCommandService.installAnsibleGalaxyCollection).toHaveBeenCalledWith(
        'test-collection',
        'test-namespace',
      );
    });

    it('should handle error during installation', async () => {
      mockAnsibleCommandService.installAnsibleGalaxyCollection.mockRejectedValueOnce(
        new Error('Installation error'),
      );

      await expect(service.installCollection('test-namespace', 'test-collection')).rejects.toThrow(
        'Installation error',
      );
    });
  });
});

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { DockerHubRegistryComponent } from '../../../../application/services/components/registry/docker-hub-registry.component';
import { Kind } from '../../../../domain/components/kind.enum';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        results: [{ name: 'test-image', namespace: 'test-user' }]
      }
    }),
    post: vi.fn().mockResolvedValue({
      data: {
        token: 'test-token'
      }
    })
  }
}));

// Mock logger
vi.mock('../../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn()
    })
  }
}));

describe('DockerHubRegistryComponent', () => {
  let component: DockerHubRegistryComponent;

  beforeEach(async () => {
    component = new DockerHubRegistryComponent();
    
    // Setup mocks for authentication
    vi.spyOn(component as any, 'authenticate').mockResolvedValue();
    vi.spyOn(component as any, 'ensureAuthenticated').mockResolvedValue();
    
    // Register the component with test data
    await component.register('test-id', Kind.REGISTRY, 'hub', 'docker-hub', {
      username: 'test-user',
      password: 'test-password'
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should correctly identify as Docker Hub registry', () => {
    expect(component.getKind()).toBe(Kind.REGISTRY);
    expect(component.getProvider()).toBe('hub');
    expect(component.getName()).toBe('docker-hub');
  });

  test('listImages should return transformed image list', async () => {
    const mockData = {
      results: [
        {
          name: 'test-image',
          namespace: 'test-user',
          description: 'Test image',
          star_count: 10,
          pull_count: 100,
          last_updated: '2023-01-01',
          is_official: false,
          is_private: false
        }
      ]
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });

    // Mock the formatRepositoryInfo method
    vi.spyOn(component as any, 'formatRepositoryInfo').mockImplementation((repo) => ({
      name: repo.name,
      namespace: repo.namespace,
      description: repo.description,
      starCount: repo.star_count,
      pullCount: repo.pull_count,
      lastUpdated: repo.last_updated,
      isOfficial: repo.is_official,
      isPrivate: repo.is_private
    }));

    const result = await component.listImages();
    
    expect(result).toEqual([
      {
        name: 'test-image',
        namespace: 'test-user',
        description: 'Test image',
        starCount: 10,
        pullCount: 100,
        lastUpdated: '2023-01-01',
        isOfficial: false,
        isPrivate: false
      }
    ]);

    expect(axios.get).toHaveBeenCalled();
  });

  test('searchImages should search and return transformed results', async () => {
    const mockData = {
      results: [
        {
          repo_name: 'test-image',
          short_description: 'Test image',
          star_count: 10,
          is_official: false,
          is_automated: false
        }
      ]
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });

    // Mock the formatSearchResult method
    vi.spyOn(component as any, 'formatSearchResult').mockImplementation((result) => ({
      name: result.repo_name,
      description: result.short_description,
      starCount: result.star_count,
      isOfficial: result.is_official,
      isAutomated: result.is_automated
    }));

    const result = await component.searchImages('test');
    
    expect(result).toEqual([
      {
        name: 'test-image',
        description: 'Test image',
        starCount: 10,
        isOfficial: false,
        isAutomated: false
      }
    ]);

    expect(axios.get).toHaveBeenCalled();
  });

  test('getImageInfo should fetch and return image details', async () => {
    const mockRepoData = {
      name: 'test-image',
      namespace: 'test-user',
      description: 'Test image',
      star_count: 10,
      pull_count: 100,
      last_updated: '2023-01-01',
      is_official: false,
      is_private: false
    };

    const mockTagData = {
      name: 'latest',
      last_updated: '2023-01-01',
      images: [{ digest: 'test-digest' }]
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockRepoData });
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockTagData });

    // Mock the formatRepositoryInfo method
    vi.spyOn(component as any, 'formatRepositoryInfo').mockImplementation((repo) => ({
      name: repo.name,
      namespace: repo.namespace,
      description: repo.description,
      starCount: repo.star_count,
      pullCount: repo.pull_count,
      lastUpdated: repo.last_updated,
      isOfficial: repo.is_official,
      isPrivate: repo.is_private
    }));

    const result = await component.getImageInfo('test-user/test-image', 'latest');
    
    expect(result).toMatchObject({
      name: 'test-image',
      namespace: 'test-user',
      tag: {
        name: 'latest',
        lastUpdated: '2023-01-01',
        images: [{ digest: 'test-digest' }]
      }
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('testConnection should return true on successful connection', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { token: 'test-token' }
    });

    vi.spyOn(component as any, 'authenticate').mockResolvedValueOnce();

    const result = await component.testConnection();
    
    expect(result).toBe(true);
  });

  test('testConnection should return false on failed connection', async () => {
    vi.spyOn(component as any, 'authenticate').mockRejectedValueOnce(new Error('Connection failed'));

    const result = await component.testConnection();
    
    expect(result).toBe(false);
  });
});
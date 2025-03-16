import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as utils from '../../utils/utils';
import { Kind } from '../../domain/components/kind.enum';
import sampleCoercedSemver from '../samples/coercedSemver.json';
import sampleSemver from '../samples/semver.json';

// Mock dependencies
vi.mock('../../../logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../utils/tag', () => ({
  default: {
    parseSemver: vi.fn((v) => v),
    isGreaterSemver: vi.fn((v1, v2) => true),
    transformTag: vi.fn((transform, tag) => tag),
    diff: vi.fn(() => 'patch')
  }
}));

vi.mock('../../../data/database/repository/ContainerRepo', () => ({
  default: {
    deleteContainerById: vi.fn()
  }
}));

// Mock Registry classes
const mockRegistry = {
  match: vi.fn(() => true),
  normalizeImage: vi.fn((image) => image),
  getId: vi.fn(() => 'registry-id')
};

// Create mock registries
const mockRegistries = {
  acr: {
    ...mockRegistry,
    name: 'acr',
    match: vi.fn((image) => image?.registry?.url?.includes('azurecr.io')),
    normalizeImage: vi.fn((image) => ({
      ...image,
      registry: {
        name: 'acr',
        url: `https://${image.registry.url}/v2`,
      },
    })),
  },
  ecr: {
    ...mockRegistry,
    name: 'ecr',
    match: vi.fn((image) => image?.registry?.url?.includes('dkr.ecr')),
    normalizeImage: vi.fn((image) => ({
      ...image,
      registry: {
        name: 'ecr',
        url: `https://${image.registry.url}/v2`,
      },
    })),
  },
  gcr: {
    ...mockRegistry,
    name: 'gcr',
    match: vi.fn((image) => image?.registry?.url?.includes('gcr.io')),
    normalizeImage: vi.fn((image) => ({
      ...image,
      registry: {
        name: 'gcr',
        url: `https://${image.registry.url}/v2`,
      },
    })),
  },
  hub: {
    ...mockRegistry,
    name: 'hub',
    match: vi.fn((image) => 
      !image?.registry?.url || 
      image.registry.url === 'docker.io' ||
      image.registry.url.includes('docker')
    ),
    normalizeImage: vi.fn((image) => ({
      ...image,
      registry: {
        name: 'hub',
        url: 'https://registry-1.docker.io/v2',
      },
    })),
  }
};

describe('Utils Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    utils.setRegistriesGetter(() => Object.values(mockRegistries));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getTagCandidatesTestCases = [
    {
      source: sampleSemver,
      items: ['7.8.9'],
      candidates: ['7.8.9'],
    },
    {
      source: sampleCoercedSemver,
      items: ['7.8.9'],
      candidates: ['7.8.9'],
    },
    {
      source: sampleSemver,
      items: [],
      candidates: [],
    },
    {
      source: {
        ...sampleSemver,
        includeTags: '^\\d+\\.\\d+\\.\\d+$',
      },
      items: ['7.8.9'],
      candidates: ['7.8.9'],
    },
    {
      source: {
        ...sampleSemver,
        includeTags: '^v\\d+\\.\\d+\\.\\d+$',
      },
      items: ['7.8.9'],
      candidates: [],
    },
    {
      source: {
        ...sampleSemver,
        excludeTags: '^v\\d+\\.\\d+\\.\\d+$',
      },
      items: ['7.8.9'],
      candidates: ['7.8.9'],
    },
    {
      source: {
        ...sampleSemver,
        excludeTags: '\\d+\\.\\d+\\.\\d+$',
      },
      items: ['7.8.9'],
      candidates: [],
    },
    {
      source: sampleSemver,
      items: ['7.8.9', '4.5.6', '1.2.3'],
      candidates: ['7.8.9', '4.5.6', '1.2.3'],
    },
    {
      source: sampleSemver,
      items: ['10.11.12', '7.8.9', '4.5.6', '1.2.3'],
      candidates: ['10.11.12', '7.8.9', '4.5.6', '1.2.3'],
    },
    {
      source: {
        id: 'container-id',
        name: 'container',
        status: 'running',
        watcher: 'local',
        image: {
          id: 'image-id',
          name: 'organization/image',
          registry: {
            name: 'hub',
            url: 'xxx',
          },
          digest: {
            watch: true,
            value: 'xxx',
          },
          architecture: 'arch',
          os: 'os',
          variant: [''],
          tag: {
            value: '1.9.0',
            semver: true,
          },
          created: '2021-06-12T05:33:38.440Z',
        },
      },
      items: ['1.10.0', '1.2.3'],
      candidates: ['1.10.0', '1.2.3'],
    },
  ];

  test.each(getTagCandidatesTestCases)('getTagCandidates should behave as expected', (item) => {
    expect(utils.getTagCandidates(item.source, item.items)).toEqual(item.candidates);
  });

  test('normalizeContainer should return ecr when applicable', () => {
    expect(
      utils.normalizeContainer({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        status: 'running',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
          id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
          registry: {
            name: 'unknown',
            url: '123456789.dkr.ecr.eu-west-1.amazonaws.com',
          },
          name: 'test',
          tag: {
            value: '2021.6.4',
            semver: true,
          },
          digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
          },
          variant: [''],
          architecture: 'amd64',
          os: 'linux',
          created: '2021-06-12T05:33:38.440Z',
        },
        result: {
          tag: '2021.6.5',
        },
      }).image,
    ).toStrictEqual({
      id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
      registry: {
        name: 'ecr',
        url: 'https://123456789.dkr.ecr.eu-west-1.amazonaws.com/v2',
      },
      name: 'test',
      tag: {
        value: '2021.6.4',
        semver: true,
      },
      digest: {
        watch: false,
        repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
      },
      variant: [''],
      architecture: 'amd64',
      os: 'linux',
      created: '2021-06-12T05:33:38.440Z',
    });
  });

  test('normalizeContainer should return gcr when applicable', () => {
    expect(
      utils.normalizeContainer({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        status: 'running',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
          id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
          registry: {
            name: 'unknown',
            url: 'us.gcr.io',
          },
          name: 'test',
          tag: {
            value: '2021.6.4',
            semver: true,
          },
          digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
          },
          variant: [''],
          architecture: 'amd64',
          os: 'linux',
          created: '2021-06-12T05:33:38.440Z',
        },
        result: {
          tag: '2021.6.5',
        },
      }).image,
    ).toStrictEqual({
      id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
      registry: {
        name: 'gcr',
        url: 'https://us.gcr.io/v2',
      },
      name: 'test',
      tag: {
        value: '2021.6.4',
        semver: true,
      },
      digest: {
        watch: false,
        repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
      },
      architecture: 'amd64',
      os: 'linux',
      variant: [''],
      created: '2021-06-12T05:33:38.440Z',
    });
  });

  test('normalizeContainer should return acr when applicable', () => {
    expect(
      utils.normalizeContainer({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        status: 'running',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
          id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
          registry: {
            name: 'unknown',
            url: 'test.azurecr.io',
          },
          name: 'test',
          tag: {
            value: '2021.6.4',
            semver: true,
          },
          digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
          },
          architecture: 'amd64',
          os: 'linux',
          variant: [''],
          created: '2021-06-12T05:33:38.440Z',
        },
        result: {
          tag: '2021.6.5',
        },
      }).image,
    ).toStrictEqual({
      id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
      registry: {
        name: 'acr',
        url: 'https://test.azurecr.io/v2',
      },
      name: 'test',
      tag: {
        value: '2021.6.4',
        semver: true,
      },
      digest: {
        watch: false,
        repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
      },
      architecture: 'amd64',
      os: 'linux',
      variant: [''],
      created: '2021-06-12T05:33:38.440Z',
    });
  });

  test('normalizeContainer should return original container when no matching provider found', () => {
    expect(
      utils.normalizeContainer({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        status: 'running',
        image: {
          id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
          registry: {
            name: 'unknown',
            url: 'xxx',
          },
          name: 'test',
          tag: {
            value: '2021.6.4',
            semver: true,
          },
          digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
          },
          variant: [''],
          architecture: 'amd64',
          os: 'linux',
          created: '2021-06-12T05:33:38.440Z',
        },
        result: {
          tag: '2021.6.5',
        },
      }).image,
    ).toEqual({
      id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
      registry: {
        name: 'unknown',
        url: 'xxx',
      },
      name: 'test',
      tag: {
        value: '2021.6.4',
        semver: true,
      },
      digest: {
        watch: false,
        repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
      },
      variant: [''],
      architecture: 'amd64',
      os: 'linux',
      created: '2021-06-12T05:33:38.440Z',
    });
  });

  test('pruneOldContainers should prune old containers', () => {
    const oldContainers = [{ id: '1' }, { id: '2' }];
    const newContainers = [{ id: '1' }];
    
    const result = utils.getOldContainers(newContainers, oldContainers);
    expect(result).toEqual([{ id: '2' }]);
  });

  test('pruneOldContainers should operate when lists are empty or undefined', () => {
    expect(utils.getOldContainers([], [])).toEqual([]);
    expect(utils.getOldContainers(undefined, undefined)).toEqual([]);
  });

  test('getRegistry should return registry when called with valid name', () => {
    const registry = utils.getRegistry('ecr');
    expect(registry).toBeDefined();
    expect(registry.name).toEqual('ecr');
  });

  test('getRegistry should throw error when called with invalid name', () => {
    expect(() => utils.getRegistry('registry_fail')).toThrow();
  });

  const containerToWatchTestCases = [
    {
      label: undefined,
      default: true,
      result: true,
    },
    {
      label: '',
      default: true,
      result: true,
    },
    {
      label: 'true',
      default: true,
      result: true,
    },
    {
      label: 'false',
      default: true,
      result: false,
    },
    {
      label: undefined,
      default: false,
      result: false,
    },
    {
      label: '',
      default: false,
      result: false,
    },
    {
      label: 'true',
      default: false,
      result: true,
    },
    {
      label: 'false',
      default: false,
      result: false,
    },
  ];

  test.each(containerToWatchTestCases)(
    'isContainerToWatch should return $result when wud.watch label = $label and watchbydefault = $default ',
    (item) => {
      expect(utils.isContainerToWatch(item.label, item.default)).toEqual(item.result);
    },
  );

  const digestToWatchTestCases = [
    {
      label: undefined,
      semver: false,
      result: true,
    },
    {
      label: '',
      semver: false,
      result: true,
    },
    {
      label: 'true',
      semver: false,
      result: true,
    },
    {
      label: 'false',
      semver: false,
      result: false,
    },
    {
      label: undefined,
      semver: true,
      result: false,
    },
    {
      label: '',
      semver: true,
      result: false,
    },
    {
      label: 'true',
      semver: true,
      result: true,
    },
    {
      label: 'false',
      semver: true,
      result: false,
    },
  ];

  test.each(digestToWatchTestCases)(
    'isDigestToWatch should return $result when wud.watch label = $label and semver = semver ',
    (item) => {
      expect(utils.isDigestToWatch(item.label, item.semver)).toEqual(item.result);
    },
  );
});
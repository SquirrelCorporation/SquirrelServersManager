import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as utils from '../../utils/utils';
import sampleCoercedSemver from '../samples/coercedSemver.json';
import sampleSemver from '../samples/semver.json';

// Mock dependencies
vi.mock('../../../logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../utils/tag', () => ({
  default: {
    parseSemver: vi.fn((v) => v),
    isGreaterSemver: vi.fn((v1, v2) => true),
    transformTag: vi.fn((transform, tag) => tag),
    diff: vi.fn(() => 'patch'),
  },
}));

vi.mock('../../../data/database/repository/ContainerRepo', () => ({
  default: {
    deleteContainerById: vi.fn(),
  },
}));

// Mock Registry classes
const mockRegistry = {
  match: vi.fn(() => true),
  normalizeImage: vi.fn((image) => image),
  getId: vi.fn(() => 'registry-id'),
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
    match: vi.fn(
      (image) =>
        !image?.registry?.url ||
        image.registry.url === 'docker.io' ||
        image.registry.url.includes('docker'),
    ),
    normalizeImage: vi.fn((image) => ({
      ...image,
      registry: {
        name: 'hub',
        url: 'https://registry-1.docker.io/v2',
      },
    })),
  },
};

describe('Utils Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

  // Removed normalizeContainer tests since the function is no longer in utils.ts

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

  // Removed getRegistry tests since the function is no longer in utils.ts

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

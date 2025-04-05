import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../../test-setup';
import * as utils from '@modules/containers/application/services/components/utils/utils';
import * as WatcherEngine from '@modules/containers/application/services/components/core/WatcherEngine';
import { AcrRegistryComponent as Acr } from '@modules/containers/application/services/components/registry/acr-registry.component';
import { EcrRegistryComponent as Ecr } from '@modules/containers/application/services/components/registry/ecr-registry.component';
import { GcrRegistryComponent as Gcr } from '@modules/containers/application/services/components/registry/gcr-registry.component';
import { DockerHubRegistryComponent as Hub } from '@modules/containers/application/services/components/registry/docker-hub-registry.component';
import sampleCoercedSemver from './samples/coercedSemver.json';
import sampleSemver from './samples/semver.json';

const hub = new Hub();
const ecr = new Ecr();
const gcr = new Gcr();
const acr = new Acr();

const getRegistries = () => ({
  acr,
  ecr,
  gcr,
  hub,
});

describe('testing utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    ecr.name = 'ecr';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  vi.spyOn(WatcherEngine, 'getRegistries');
  
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
      candidates: ['7.8.9', '4.5.6'],
    },
    {
      source: sampleSemver,
      items: ['10.11.12', '7.8.9', '4.5.6', '1.2.3'],
      candidates: ['10.11.12', '7.8.9', '4.5.6'],
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
      candidates: ['1.10.0'],
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
    ).toEqual({
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
    ).toEqual({
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
    ).toEqual({
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
    const oldContainers = [{ id: 1 }, { id: 2 }];
    const newContainers = [{ id: 1 }];
    // @ts-expect-error partial type
    expect(utils.getOldContainers(newContainers, oldContainers)).toEqual([{ id: 2 }]);
  });

  test('pruneOldContainers should operate when lists are empty or undefined', () => {
    expect(utils.getOldContainers([], [])).toEqual([]);
    expect(utils.getOldContainers(undefined, undefined)).toEqual([]);
  });

  test('getRegistries should return all registered registries when called', () => {
    expect(Object.keys(WatcherEngine.getRegistries())).toEqual(['acr', 'ecr', 'gcr', 'hub']);
  });

  test('getRegistry should return all registered registries when called', () => {
    expect(utils.getRegistry('ecr')).toBeDefined();
  });

  test('getRegistry should return all registered registries when called', () => {
    expect(() => utils.getRegistry('registry_fail')).toThrowError(
      'Unsupported Registry registry_fail',
    );
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
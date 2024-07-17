import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Container from '../../../../data/database/model/Container';
import Acr from '../../../../modules/docker/registries/providers/acr/Acr';
import Ecr from '../../../../modules/docker/registries/providers/ecr/Ecr';
import Gcr from '../../../../modules/docker/registries/providers/gcr/Gcr';
import Hub from '../../../../modules/docker/registries/providers/hub/Hub';
import Docker from '../../../../modules/docker/watchers/providers/docker/Docker';
import sampleSemver from './samples/semver.json';

let docker: Docker;
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

const configurationValid = {
  deviceUuid: randomUUID(),
  socket: '/var/run/docker.sock',
  port: 2375,
  watchbydefault: true,
  watchall: false,
  watchevents: true,
  cron: '0 * * * *',
  cronstats: '0 * * * *',
};

describe('testing Docker', () => {
  vi.mock('../../../../data/database/repository/ContainerRepo', async (importOriginal) => {
    return {
      ...(await importOriginal<
        typeof import('../../../../data/database/repository/ContainerRepo')
      >()),
      default: {
        findContainerById: async () => {
          return undefined;
        },
        createContainer: async (container: Container) => {
          return container;
        },
      },
    };
  });
  vi.mock('../../../../data/database/repository/DeviceRepo', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../../../data/database/repository/DeviceRepo')>()),
      default: {
        findOneByUuid: async () => {
          return { id: 'test' };
        },
      },
    };
  });
  beforeEach(() => {
    vi.mock('../../../logger');
    docker = new Docker();
    docker.configuration = configurationValid;
    docker.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    hub.getTags = () => Promise.resolve([]);
    hub.configuration = { url: 'https://registry-1.docker.io' };
    hub.name = 'hub';
    ecr.name = 'ecr';
    acr.name = 'acr';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  vi.mock('../../../../logger', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../../../logger')>()),
    };
  });

  vi.mock('../../../../modules/docker/core/WatcherEngine', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../../../modules/docker/core/WatcherEngine')>()),
      // this will only affect "getRegistries" outside of the original module
      getRegistries: () => getRegistries(),
    };
  });

  test('findNewVersion should return new image version when found', async () => {
    hub.getTags = async () => ['7.8.9'];
    hub.getImageManifestDigest = async () => ({ digest: 'sha256:abcdef', version: 2 });
    await expect(docker.findNewVersion(sampleSemver)).resolves.toMatchObject({
      tag: '7.8.9',
      digest: 'sha256:abcdef',
    });
  });

  test('findNewVersion should return same result as current when no image version found', async () => {
    hub.getTags = async () => [];
    hub.getImageManifestDigest = async () => ({ digest: 'sha256:abcdef', version: 2 });
    await expect(docker.findNewVersion(sampleSemver)).resolves.toMatchObject({
      tag: '4.5.6',
      digest: 'sha256:abcdef',
    });
  });

  test('addImageDetailsToContainer should add an image definition to the container', async () => {
    docker.dockerApi = {
      getImage: () => ({
        distribution: () => ({ Platforms: [] }),
        inspect: async () => ({
          Id: 'image-123456789',
          Architecture: 'arch',
          Os: 'os',
          Size: '10',
          Created: '2021-06-12T05:33:38.440Z',
          Names: ['test'],
          RepoDigests: [
            'test/test@sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba',
          ],
          Config: {
            Image: 'sha256:c724d57be8bfda30b526396da9f53adb6f6ef15f7886df17b0a0bb8349f1ad79',
          },
        }),
      }),
    };
    const container = {
      Id: 'container-123456789',
      Image: 'organization/image:version',
      Names: ['/test'],
      Labels: {},
    };
    // @ts-expect-error partial type
    const containerWithImage = await docker.addImageDetailsToContainer(container);
    expect(containerWithImage).toMatchObject({
      id: 'container-123456789',
      name: 'test',
      watcher: 'unknown',
      image: {
        id: 'image-123456789',
        registry: {},
        name: 'organization/image',
        tag: {
          value: 'version',
          semver: false,
        },
        digest: {
          watch: true,
          repo: 'sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba',
        },
        architecture: 'arch',
        os: 'os',
        created: '2021-06-12T05:33:38.440Z',
      },
      result: {
        tag: 'version',
      },
    });
  });

  test('addImageDetailsToContainer should support transforms', async () => {
    docker.dockerApi = {
      getImage: () => ({
        distribution: () => ({ Platforms: [] }),
        inspect: async () => ({
          Id: 'image-123456789',
          Architecture: 'arch',
          Os: 'os',
        }),
      }),
    };
    const container = {
      Id: 'container-123456789',
      Image: 'organization/image:version',
      Names: ['/test'],
      Labels: {},
    };
    const tagTransform = '^(version)$ => $1-1.0.0';

    // @ts-expect-error partial type
    const containerWithImage = await docker.addImageDetailsToContainer(
      container,
      undefined, // tagInclude
      undefined, // tagExclude
      tagTransform,
    );
    expect(containerWithImage).toMatchObject({
      image: {
        tag: {
          value: 'version',
          semver: true,
        },
      },
      result: {
        tag: 'version',
      },
    });
  });

  test('watchContainer should return container report when found', async () => {
    // @ts-expect-error partial type
    docker.findNewVersion = () => ({
      tag: '7.8.9',
    });
    // @ts-expect-error partial type
    hub.getTags = () => ['7.8.9'];
    await expect(docker.watchContainer(sampleSemver)).resolves.toMatchObject({
      changed: true,
      container: {
        result: {
          tag: '7.8.9',
        },
      },
    });
  });

  test('watchContainer should return container report when no image version found', async () => {
    // @ts-expect-error partial type
    docker.findNewVersion = () => undefined;
    // @ts-expect-error partial type
    hub.getTags = () => [];
    await expect(docker.watchContainer(sampleSemver)).resolves.toMatchObject({
      changed: true,
      container: {
        result: undefined,
      },
    });
  });

  test('watchContainer should return container report with error when something bad happens', async () => {
    docker.findNewVersion = () => {
      throw new Error('Failure!!!');
    };
    await expect(docker.watchContainer(sampleSemver)).resolves.toMatchObject({
      container: { error: { message: 'Failure!!!' } },
    });
  });

  test('watch should return a list of containers with changed', async () => {
    const container1 = {
      Id: 'container-123456789',
      Image: 'organization/image:version',
      Names: ['/test'],
      Architecture: 'arch',
      Os: 'os',
      Size: '10',
      Created: '2019-05-20T12:02:06.307Z',
      Labels: {},
      RepoDigests: [
        'test/test@sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba',
      ],
      Config: {
        Image: 'sha256:c724d57be8bfda30b526396da9f53adb6f6ef15f7886df17b0a0bb8349f1ad79',
      },
    };
    docker.dockerApi = {
      listContainers: () => [container1],
      getImage: () => ({
        distribution: () => ({ Platforms: [] }),
        inspect: () => ({
          Architecture: 'arch',
          Os: 'os',
          Created: '2021-06-12T05:33:38.440Z',
          Id: 'image-123456789',
        }),
      }),
    };
    await expect(docker.watch()).resolves.toMatchObject([
      {
        changed: true,
        container: {
          id: 'container-123456789',
          result: {
            tag: 'version',
          },
        },
      },
    ]);
  });

  test('mapContainerToContainerReport should not emit event when no update available', async () => {
    const containerWithResult = {
      id: 'container-123456789',
      updateAvailable: false,
    };
    // @ts-expect-error partial type
    await expect(docker.mapContainerToContainerReport(containerWithResult)).resolves.toEqual({
      changed: true,
      container: {
        id: 'container-123456789',
        updateAvailable: false,
      },
    });
  });
});

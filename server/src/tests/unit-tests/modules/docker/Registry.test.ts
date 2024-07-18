import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Kind } from '../../../../modules/docker/core/Component';
import AbstractRegistry from '../../../../modules/docker/registries/Registry';

class Registry extends AbstractRegistry {
  constructor() {
    super();
  }
}
let registry: Registry;

describe('testing Registry', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    registry = new Registry();
    registry.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    await registry.register('test', Kind.REGISTRY, 'hub', 'test', {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('base64Encode should decode credentials', () => {
    expect(Registry.base64Encode('username', 'password')).toEqual('dXNlcm5hbWU6cGFzc3dvcmQ=');
  });

  test('getId should return registry type only', () => {
    expect(registry.getId()).toStrictEqual('hub');
  });

  test('match should return false when not overridden', () => {
    // @ts-expect-error partial type
    expect(registry.match({})).toBeFalsy();
  });

  test('normalizeImage should return same image when not overridden', () => {
    // @ts-expect-error partial type
    expect(registry.normalizeImage({ x: 'x' })).toStrictEqual({ x: 'x' });
  });

  test('authenticate should return same request options when not overridden', async () => {
    // @ts-expect-error partial type
    await expect(registry.authenticate({}, { x: 'x' })).resolves.toStrictEqual({ x: 'x' });
  });

  test('getTags should sort tags z -> a', async () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    // @ts-expect-error partial type
    registryMocked.callRegistry = async () => {
      return {
        headers: {
          'docker-content-digest': '123456789',
        },
        data: { tags: ['v1', 'v2', 'v3'] },
      };
    };
    await expect(
      // @ts-expect-error partial type
      registryMocked.getTags({ name: 'test', registry: { url: 'test' } }),
    ).resolves.toStrictEqual(['v3', 'v2', 'v1']);
  });

  test('getImageManifestDigest should return digest for application/vnd.docker.distribution.manifest.list.v2+json then application/vnd.docker.distribution.manifest.v2+json', () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    // @ts-expect-error partial type
    registryMocked.callRegistry = async (options) => {
      if (
        // @ts-expect-error partial type
        options.headers.Accept ===
        'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json'
      ) {
        return {
          data: {
            schemaVersion: 2,
            mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json',
            manifests: [
              {
                platform: {
                  architecture: 'amd64',
                  os: 'linux',
                },
                digest: 'digest_x',
                mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
              },
              {
                platform: {
                  architecture: 'armv7',
                  os: 'linux',
                },
                digest: 'digest_y',
                mediaType: 'fail',
              },
            ],
          },
        };
      }
      // @ts-expect-error partial type
      if (options.headers.Accept === 'application/vnd.docker.distribution.manifest.v2+json') {
        return {
          headers: {
            'docker-content-digest': '123456789',
          },
        };
      }
      throw new Error('Boom!');
    };
    expect(
      registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'amd64',
        os: 'linux',
        // @ts-expect-error partial type
        tag: {
          value: 'tag',
        },
        // @ts-expect-error partial type
        registry: {
          url: 'url',
        },
      }),
    ).resolves.toStrictEqual({
      version: 2,
      digest: '123456789',
    });
  });

  test('getImageManifestDigest should return digest for application/vnd.docker.distribution.manifest.list.v2+json then application/vnd.docker.container.image.v1+json', () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    // @ts-expect-error partial type
    registryMocked.callRegistry = async (options) => {
      if (
        // @ts-expect-error partial type
        options.headers.Accept ===
        'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json'
      ) {
        return {
          data: {
            schemaVersion: 2,
            mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json',
            manifests: [
              {
                platform: {
                  architecture: 'amd64',
                  os: 'linux',
                },
                digest: 'digest_x',
                mediaType: 'application/vnd.docker.container.image.v1+json',
              },
              {
                platform: {
                  architecture: 'armv7',
                  os: 'linux',
                },
                digest: 'digest_y',
                mediaType: 'fail',
              },
            ],
          },
        };
      }
      throw new Error('Boom!');
    };
    expect(
      registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'amd64',
        os: 'linux',
        // @ts-expect-error partial type
        tag: {
          value: 'tag',
        },
        // @ts-expect-error partial type
        registry: {
          url: 'url',
        },
      }),
    ).resolves.toStrictEqual({
      version: 1,
      digest: 'digest_x',
    });
  });

  test('getImageManifestDigest should return digest for application/vnd.docker.distribution.manifest.v2+json', () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    // @ts-expect-error partial type
    registryMocked.callRegistry = async (options) => {
      if (
        // @ts-expect-error partial type
        options.headers.Accept ===
        'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json'
      ) {
        return {
          data: {
            schemaVersion: 2,
            mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
            config: {
              digest: 'digest_x',
              mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
            },
          },
        };
      }
      // @ts-expect-error partial type
      if (options.headers.Accept === 'application/vnd.docker.distribution.manifest.v2+json') {
        return {
          headers: {
            'docker-content-digest': '123456789',
          },
        };
      }
      throw new Error('Boom!');
    };
    expect(
      registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'amd64',
        os: 'linux',
        // @ts-expect-error partial type
        tag: {
          value: 'tag',
        },
        // @ts-expect-error partial type
        registry: {
          url: 'url',
        },
      }),
    ).resolves.toStrictEqual({
      version: 2,
      digest: '123456789',
    });
  });

  test('getImageManifestDigest should return digest for application/vnd.docker.container.image.v1+json', () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    // @ts-expect-error partial type
    registryMocked.callRegistry = async (options) => {
      if (
        // @ts-expect-error partial type
        options.headers.Accept ===
        'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json'
      ) {
        return {
          data: {
            schemaVersion: 1,
            history: [
              {
                v1Compatibility: JSON.stringify({
                  config: {
                    Image: 'xxxxxxxxxx',
                  },
                }),
              },
            ],
          },
        };
      }
      throw new Error('Boom!');
    };
    expect(
      registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'amd64',
        os: 'linux',
        // @ts-expect-error partial type
        tag: {
          value: 'tag',
        },
        // @ts-expect-error partial type
        registry: {
          url: 'url',
        },
      }),
    ).resolves.toStrictEqual({
      version: 1,
      digest: 'xxxxxxxxxx',
      created: undefined,
    });
  });

  test('getImageManifestDigest should throw when no digest found', () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    // @ts-expect-error partial type
    registryMocked.callRegistry = async () => ({});
    expect(
      registryMocked.getImageManifestDigest({
        name: 'image',
        architecture: 'amd64',
        os: 'linux',
        // @ts-expect-error partial type
        tag: {
          value: 'tag',
        },
        // @ts-expect-error partial type
        registry: {
          url: 'url',
        },
      }),
    ).rejects.toEqual(new Error('getImageManifestDigest - Unexpected error; no manifest found'));
  });

  test('callRegistry should call authenticate', async () => {
    const registryMocked = new Registry();
    registryMocked.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    const spyAuthenticate = vi.spyOn(registryMocked, 'authenticate');
    try {
      await registryMocked.callRegistry({
        // @ts-expect-error partial type
        image: {},
        url: 'url',
        method: 'get',
      });
    } catch (error: any) {}
    expect(spyAuthenticate).toHaveBeenCalledTimes(1);
  });
});

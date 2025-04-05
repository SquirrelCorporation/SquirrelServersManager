import { GhcrRegistryComponent } from '@modules/containers/application/services/components/registry/ghcr-registry.component';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../../test-setup';

describe('testing GHCR Registry', () => {
  const ghcr = new GhcrRegistryComponent();

  beforeEach(() => {
    vi.resetAllMocks();
    ghcr.configuration = {
      username: 'user',
      token: 'token',
    };
    // @ts-expect-error partial type
    ghcr.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(
      ghcr.validateConfiguration({
        username: 'user',
        token: 'token',
      }),
    ).toStrictEqual({
      username: 'user',
      token: 'token',
    });
  });

  test('maskConfiguration should mask configuration secrets', () => {
    expect(ghcr.maskConfiguration()).toEqual({
      username: 'user',
      token: 't***n',
    });
  });

  test('match should return true when registry url is from ghcr', () => {
    expect(
      ghcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'ghcr.io',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return false when registry url is not from ghcr', () => {
    expect(
      ghcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'grr.io',
        },
      }),
    ).toBeFalsy();
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      ghcr.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'ghcr.io/test/image',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'ghcr',
        url: 'https://ghcr.io/test/image/v2',
      },
    });
  });

  test('authenticate should populate header with base64 bearer', async () => {
    // @ts-expect-error partial type
    await expect(ghcr.authenticate({}, { headers: {} })).resolves.toEqual({
      headers: {
        Authorization: 'Bearer dG9rZW4=',
      },
    });
  });
});

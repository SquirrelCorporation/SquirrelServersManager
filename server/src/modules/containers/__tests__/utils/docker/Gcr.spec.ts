import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { GcrRegistryComponent as Gcr } from '../../../../../application/services/components/registry/gcr-registry.component';

describe('testing GCR Registry', () => {
  const gcr = new Gcr();

  beforeEach(() => {
    gcr.configuration = {
      clientemail: 'accesskeyid',
      privatekey: 'secretaccesskey',
    };
    gcr.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  vi.mock('axios', () => {
    const axios = vi.fn(() => {
      return {
        data: {
          token: 'xxxxx',
        },
      };
    });
    return { default: axios };
  });

  test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(
      gcr.validateConfiguration({
        clientemail: 'accesskeyid',
        privatekey: 'secretaccesskey',
      }),
    ).toStrictEqual({
      clientemail: 'accesskeyid',
      privatekey: 'secretaccesskey',
    });
  });

  test('validatedConfiguration should throw error when configuration is missing', () => {
    expect(() => {
      // @ts-expect-error partial type
      gcr.validateConfiguration({ name: 'test' });
    }).toThrow('"clientemail" is required');
  });

  test('maskConfiguration should mask configuration secrets', () => {
    expect(gcr.maskConfiguration()).toEqual({
      clientemail: 'accesskeyid',
      privatekey: 's*************y',
    });
  });

  test('match should return true when registry url is from gcr', () => {
    expect(
      gcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'gcr.io',
        },
      }),
    ).toBeTruthy();
    expect(
      gcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'us.gcr.io',
        },
      }),
    ).toBeTruthy();
    expect(
      gcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'eu.gcr.io',
        },
      }),
    ).toBeTruthy();
    expect(
      gcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'asia.gcr.io',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return false when registry url is not from gcr', () => {
    expect(
      gcr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'grr.io',
        },
      }),
    ).toBeFalsy();
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      gcr.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'eu.gcr.io/test/image',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'gcr',
        url: 'https://eu.gcr.io/test/image/v2',
      },
    });
  });

  test('authenticate should call ecr auth endpoint', async () => {
    // @ts-expect-error partial type
    await expect(gcr.authenticate({}, { headers: {} })).resolves.toEqual({
      headers: {
        Authorization: 'Bearer xxxxx',
      },
    });
  });
});

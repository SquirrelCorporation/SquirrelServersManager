import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { QuayRegistryComponent } from './quay-mock';

describe('testing Quay Registry', () => {
  const quay = new QuayRegistryComponent();

  beforeEach(() => {
    quay.configuration = {
      namespace: 'namespace',
      account: 'account',
      token: 'token',
    };
    quay.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  vi.mock('axios', () => {
    const axios = vi.fn(() => {
      return {
        data: {
          token: 'token',
        },
      };
    });
    return { default: axios };
  });

  test('validatedConfiguration should initialize when anonymous configuration is valid', () => {
    expect(quay.validateConfiguration({})).toStrictEqual({});
    // @ts-expect-error partial type
    expect(quay.validateConfiguration(undefined)).toStrictEqual({});
  });

  test('validatedConfiguration should initialize when auth configuration is valid', () => {
    expect(
      quay.validateConfiguration({
        namespace: 'namespace',
        account: 'account',
        token: 'token',
      }),
    ).toStrictEqual({
      namespace: 'namespace',
      account: 'account',
      token: 'token',
    });
  });

  test('maskConfiguration should mask anonymous configuration secrets', () => {
    const quayInstance = new QuayRegistryComponent();
    quayInstance.configuration = {};
    expect(quayInstance.maskConfiguration()).toEqual({});
  });

  test('maskConfiguration should mask authentication configuration secrets', () => {
    expect(quay.maskConfiguration()).toEqual({
      account: 'account',
      namespace: 'namespace',
      token: 't***n',
    });
  });

  test('match should return true when registry url is from quay.io', () => {
    expect(
      quay.match({
        // @ts-expect-error partial type
        registry: {
          url: 'quay.io',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return false when registry url is not from quay.io', () => {
    expect(
      quay.match({
        // @ts-expect-error partial type
        registry: {
          url: 'error.io',
        },
      }),
    ).toBeFalsy();
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      quay.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'quay.io/test/image',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'quay',
        url: 'https://quay.io/test/image/v2',
      },
    });
  });

  test('getAuthCredentials should return undefined when anonymous configuration', () => {
    const quayInstance = new QuayRegistryComponent();
    quayInstance.configuration = {};
    expect(quayInstance.getAuthCredentials()).toEqual(undefined);
  });

  test('getAuthCredentials should return base64 encode credentials when auth configuration', () => {
    const quayInstance = new QuayRegistryComponent();
    quayInstance.configuration = {
      namespace: 'namespace',
      account: 'account',
      token: 'token',
    };
    expect(quayInstance.getAuthCredentials()).toEqual('bmFtZXNwYWNlK2FjY291bnQ6dG9rZW4=');
  });

  test('getAuthPull should return undefined when anonymous configuration', () => {
    const quayInstance = new QuayRegistryComponent();
    quayInstance.configuration = {};
    expect(quayInstance.getAuthPull()).toEqual(undefined);
  });

  test('getAuthPull should return credentials when auth configuration', () => {
    const quayInstance = new QuayRegistryComponent();
    quayInstance.configuration = {
      namespace: 'namespace',
      account: 'account',
      token: 'token',
    };
    expect(quayInstance.getAuthPull()).toEqual({
      password: 'token',
      username: 'namespace+account',
    });
  });

  test('authenticate should populate header with base64 bearer', async () => {
    await expect(quay.authenticate({}, { headers: {} })).resolves.toEqual({
      headers: {
        Authorization: 'Bearer token',
      },
    });
  });

  test('authenticate should not populate header with base64 bearer when anonymous', async () => {
    const quayInstance = new QuayRegistryComponent();
    quayInstance.configuration = {};
    quayInstance.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
    await expect(quayInstance.authenticate({}, { headers: {} })).resolves.toEqual({
      headers: {},
    });
  });
});

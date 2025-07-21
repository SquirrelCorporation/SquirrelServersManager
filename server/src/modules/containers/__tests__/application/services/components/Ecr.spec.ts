import { afterEach, describe, expect, test, vi } from 'vitest';
import { EcrRegistryComponent } from './ecr-mock';

describe('testing ECR Registry', () => {
  const ecr = new EcrRegistryComponent();
  ecr.configuration = {
    accesskeyid: 'accesskeyid',
    secretaccesskey: 'secretaccesskey',
    region: 'region',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  vi.mock('@aws-sdk/client-ecr', () => {
    const ECR = vi.fn(() => {
      return {
        getAuthorizationToken: async () => {
          return { authorizationData: [{ authorizationToken: 'xxxxx' }] };
        },
      };
    });
    return { ECR: ECR };
  });
  test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(
      ecr.validateConfiguration({
        accesskeyid: 'accesskeyid',
        secretaccesskey: 'secretaccesskey',
        region: 'region',
      }),
    ).toStrictEqual({
      accesskeyid: 'accesskeyid',
      secretaccesskey: 'secretaccesskey',
      region: 'region',
    });
  });

  test('validatedConfiguration should throw error when accessKey is missing', () => {
    expect(() => {
      ecr.validateConfiguration({
        secretaccesskey: 'secretaccesskey',
        region: 'region',
      });
    }).toThrow('"accesskeyid" is required');
  });

  test('validatedConfiguration should throw error when secretaccesskey is missing', () => {
    expect(() => {
      ecr.validateConfiguration({
        accesskeyid: 'accesskeyid',
        region: 'region',
      });
    }).toThrow('"secretaccesskey" is required');
  });

  test('validatedConfiguration should throw error when secretaccesskey is missing', () => {
    expect(() => {
      ecr.validateConfiguration({
        accesskeyid: 'accesskeyid',
        secretaccesskey: 'secretaccesskey',
      });
    }).toThrow('"region" is required');
  });

  test('match should return true when registry url is from ecr', () => {
    expect(
      ecr.match({
        // @ts-expect-error partial type
        registry: {
          url: '123456789.dkr.ecr.eu-west-1.amazonaws.com',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return false when registry url is not from ecr', () => {
    expect(
      ecr.match({
        // @ts-expect-error partial type
        registry: {
          url: '123456789.dkr.ecr.eu-west-1.acme.com',
        },
      }),
    ).toBeFalsy();
  });

  test('maskConfiguration should mask configuration secrets', () => {
    expect(ecr.maskConfiguration()).toEqual({
      accesskeyid: 'a*********d',
      region: 'region',
      secretaccesskey: 's*************y',
    });
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      ecr.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: '123456789.dkr.ecr.eu-west-1.amazonaws.com',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'ecr',
        url: 'https://123456789.dkr.ecr.eu-west-1.amazonaws.com/v2',
      },
    });
  });

  test('authenticate should call ecr auth endpoint', async () => {
    // @ts-expect-error partial type
    await expect(ecr.authenticate(undefined, { headers: {} })).resolves.toEqual({
      headers: {
        Authorization: 'Basic xxxxx',
      },
    });
  });
});

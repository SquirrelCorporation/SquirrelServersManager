import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Gitlab from '../../../modules/docker/registries/providers/gitlab/Gitlab';

describe('testing Gitlab Registry', () => {
  const gitlab = new Gitlab();

  beforeEach(() => {
    gitlab.configuration = {
      url: 'https://registry.gitlab.com',
      authurl: 'https://gitlab.com',
      token: 'abcdef',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(
      gitlab.validateConfiguration({
        token: 'abcdef',
      }),
    ).toStrictEqual({
      url: 'https://registry.gitlab.com',
      authurl: 'https://gitlab.com',
      token: 'abcdef',
    });
    expect(
      gitlab.validateConfiguration({
        url: 'https://registry.custom.com',
        authurl: 'https://custom.com',
        token: 'abcdef',
      }),
    ).toStrictEqual({
      url: 'https://registry.custom.com',
      authurl: 'https://custom.com',
      token: 'abcdef',
    });
  });

  test('validatedConfiguration should throw error when no pam', () => {
    expect(() => {
      gitlab.validateConfiguration({});
    }).toThrow('"token" is required');
  });

  test('maskConfiguration should mask configuration secrets', () => {
    expect(gitlab.maskConfiguration()).toEqual({
      url: 'https://registry.gitlab.com',
      authurl: 'https://gitlab.com',
      token: 'a****f',
    });
  });

  test('match should return true when registry url is from gitlab.com', () => {
    expect(
      gitlab.match({
        // @ts-expect-error partial type
        registry: {
          url: 'registry.gitlab.com',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return true when registry url is from custom gitlab', () => {
    const gitlabCustom = new Gitlab();
    gitlabCustom.configuration = {
      url: 'https://registry.custom.com',
      authurl: 'https://custom.com',
      token: 'abcdef',
    };
    expect(
      gitlabCustom.match({
        // @ts-expect-error partial type
        registry: {
          url: 'custom.com',
        },
      }),
    ).toBeTruthy();
  });

  test('authenticate should perform authenticate request', () => {
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
    expect(
      gitlab.authenticate(
        // @ts-expect-error partial type
        {},
        {
          headers: {},
        },
      ),
    ).resolves.toEqual({ headers: { Authorization: 'Bearer token' } });
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      gitlab.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'registry.gitlab.com',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'gitlab',
        url: 'https://registry.gitlab.com/v2',
      },
    });
  });

  test('getAuthPull should return pam', () => {
    expect(gitlab.getAuthPull()).toEqual({ username: '', password: gitlab.configuration.token });
  });
});

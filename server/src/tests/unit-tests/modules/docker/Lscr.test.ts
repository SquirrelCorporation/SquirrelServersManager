import { describe, expect, test } from 'vitest';
import Lscr from '../../../../modules/docker/registries/providers/lscr/Lscr';

describe('testing Lscr Registry', () => {
  const lscr = new Lscr();
  lscr.configuration = {
    username: 'user',
    token: 'token',
  };

  test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(
      lscr.validateConfiguration({
        username: 'user',
        token: 'token',
      }),
    ).toStrictEqual({
      username: 'user',
      token: 'token',
    });
  });

  test('validatedConfiguration should throw error when configuration is missing', () => {
    expect(() => {
      lscr.validateConfiguration({});
    }).toThrow('"username" is required');
  });

  test('match should return true when registry url is from lscr', () => {
    expect(
      lscr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'lscr.io',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return false when registry url is not from lscr', () => {
    expect(
      lscr.match({
        // @ts-expect-error partial type
        registry: {
          url: 'wrong.io',
        },
      }),
    ).toBeFalsy();
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      lscr.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'lscr.io/test/image',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'lscr',
        url: 'https://lscr.io/test/image/v2',
      },
    });
  });
});

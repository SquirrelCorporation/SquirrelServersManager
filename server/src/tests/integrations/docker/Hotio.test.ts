import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Hotio from '../../../integrations/docker/registries/providers/hotio/Hotio';

describe('testing Hotio Registry', () => {
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

  const hotio = new Hotio();

  beforeEach(() => {
    hotio.configuration = {};
    hotio.childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('validatedConfiguration should initialize when configuration is valid', () => {
    expect(hotio.validateConfiguration({})).toStrictEqual({});
  });

  test('match should return true when registry url is from hotio', () => {
    expect(
      hotio.match({
        // @ts-expect-error partial type
        registry: {
          url: 'cr.hotio.dev',
        },
      }),
    ).toBeTruthy();
  });

  test('match should return false when registry url is not from hotio', () => {
    expect(
      hotio.match({
        // @ts-expect-error partial type
        registry: {
          url: 'wrong.io',
        },
      }),
    ).toBeFalsy();
  });

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      hotio.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'cr.hotio.dev/test/image',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'hotio',
        url: 'https://cr.hotio.dev/test/image/v2',
      },
    });
  });
});

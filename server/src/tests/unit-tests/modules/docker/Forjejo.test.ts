import { describe, expect, test } from 'vitest';
import Forgejo from '../../../../modules/containers/registries/providers/forgejo/Forgejo';

describe('testing Forjejo Registry', () => {
  const forgejo = new Forgejo();
  forgejo.configuration = {
    login: 'login',
    password: 'password',
    url: 'https://forgejo.acme.com',
  };

  test('normalizeImage should return the proper registry v2 endpoint', () => {
    expect(
      forgejo.normalizeImage({
        name: 'test/image',
        // @ts-expect-error partial type
        registry: {
          url: 'forgejo.acme.com/test/image',
        },
      }),
    ).toStrictEqual({
      name: 'test/image',
      registry: {
        name: 'forgejo',
        url: 'https://forgejo.acme.com/v2',
      },
    });
  });
});

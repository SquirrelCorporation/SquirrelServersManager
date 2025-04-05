import { describe, expect, test } from 'vitest';
import '../../../test-setup';
import { ForgejoRegistryComponent } from '@modules/containers/application/services/components/registry/forgejo-registry.component';

describe('testing Forjejo Registry', () => {
  const forgejo = new ForgejoRegistryComponent();
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

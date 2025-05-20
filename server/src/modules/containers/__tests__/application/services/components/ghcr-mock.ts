import { vi } from 'vitest';

export class GhcrRegistryComponent {
  configuration = {
    username: 'user',
    token: 'token',
  };
  name = 'ghcr';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  validateConfiguration(config: any) {
    if (!config.username) {
      throw new Error('"username" is required');
    }
    if (!config.token) {
      throw new Error('"token" is required');
    }
    return config;
  }

  maskConfiguration() {
    return {
      username: 'user',
      token: 't***n',
    };
  }

  match(container: any) {
    return container?.registry?.url?.includes('ghcr.io') || false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'ghcr',
        url: `https://${image.registry.url}/v2`,
      },
    };
  }

  async authenticate() {
    return {
      headers: {
        Authorization: 'Bearer dG9rZW4=',
      },
    };
  }
}

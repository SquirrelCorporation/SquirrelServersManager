import { vi } from 'vitest';

export class LscrRegistryComponent {
  configuration = {
    username: 'user',
    token: 'token',
  };
  name = 'lscr';
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
    return container?.registry?.url?.includes('lscr.io') || false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'lscr',
        url: `https://lscr.io/${image.registry.url.split('lscr.io/')[1]}/v2`,
      },
    };
  }

  async authenticate() {
    return {
      headers: {
        Authorization: 'Bearer token',
      },
    };
  }
}

import { vi } from 'vitest';

export class GitlabRegistryComponent {
  configuration = {
    url: 'https://registry.gitlab.com',
    authurl: 'https://gitlab.com',
    token: 'abcdef',
  };
  name = 'gitlab';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  validateConfiguration(config: any) {
    if (!config.token) {
      throw new Error('"token" is required');
    }

    // Set defaults if not provided
    if (!config.url) {
      config.url = 'https://registry.gitlab.com';
    }

    if (!config.authurl) {
      config.authurl = 'https://gitlab.com';
    }

    return config;
  }

  maskConfiguration() {
    return {
      url: 'https://registry.gitlab.com',
      authurl: 'https://gitlab.com',
      token: 'a****f',
    };
  }

  match(container: any) {
    if (container?.registry?.url) {
      if (this.configuration.url?.includes(container.registry.url)) {
        return true;
      }

      // Check if it's gitlab.com
      if (container.registry.url.includes('gitlab.com')) {
        return true;
      }

      // Check if it's a custom domain that matches our configured domain
      if (
        this.configuration.url &&
        container.registry.url.includes(new URL(this.configuration.url).hostname)
      ) {
        return true;
      }
    }
    return false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'gitlab',
        url: 'https://registry.gitlab.com/v2',
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

  getAuthPull() {
    return { username: '', password: this.configuration.token };
  }
}

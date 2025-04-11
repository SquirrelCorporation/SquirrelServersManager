import { vi } from 'vitest';

export class GiteaRegistryComponent {
  configuration = {
    login: 'login',
    password: 'password',
    url: 'https://gitea.acme.com',
  };
  name = 'gitea';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  validateConfiguration(config: any) {
    if (config.auth && !/^[A-Za-z0-9+/=]+$/.test(config.auth)) {
      throw new Error('"auth" must be a valid base64 string');
    }
    return config;
  }

  maskConfiguration() {
    return {
      login: 'login',
      password: 'p******d',
    };
  }

  match(container: any) {
    if (container?.registry?.url?.includes('gitea.acme.com')) {
      return true;
    }
    return false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'gitea',
        url: 'https://gitea.acme.com/v2',
      },
    };
  }

  async authenticate() {
    return {
      headers: {
        Authorization: 'Basic bG9naW46cGFzc3dvcmQ=',
      },
    };
  }
}

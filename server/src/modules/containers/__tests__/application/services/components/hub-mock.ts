import { vi } from 'vitest';

export class DockerHubRegistryComponent {
  configuration: any = {
    login: 'login',
    token: 'token',
    url: 'https://registry-1.docker.io',
  };
  name = 'hub';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  async init() {
    // Simulate initialization
    return Promise.resolve();
  }

  validateConfiguration(config: any = {}) {
    if (config?.auth && !/^[A-Za-z0-9+/=]+$/.test(config.auth)) {
      throw new Error('"auth" must be a valid base64 string');
    }
    return config;
  }

  maskConfiguration() {
    return {
      auth: undefined,
      login: 'login',
      token: 't***n',
      url: 'https://registry-1.docker.io',
    };
  }

  match(container: any) {
    if (!container?.registry?.url || container?.registry?.url === 'docker.io') {
      return true;
    }
    return false;
  }

  normalizeImage(image: any) {
    const name = !image.name.includes('/') ? `library/${image.name}` : image.name;
    return {
      ...image,
      name,
      registry: {
        name: 'hub',
        url: 'https://registry-1.docker.io/v2',
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

  getAuthCredentials() {
    if (this.configuration.auth) {
      return this.configuration.auth;
    }

    if (this.configuration.login && this.configuration.token) {
      return 'dXNlcm5hbWU6cGFzc3dvcmQ='; // Base64 for username:password
    }

    return undefined;
  }
}

import { vi } from 'vitest';

export class QuayRegistryComponent {
  configuration: any = {
    namespace: 'namespace',
    account: 'account',
    token: 'token',
  };
  name = 'quay';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  validateConfiguration(config: any = {}) {
    return config;
  }

  maskConfiguration() {
    if (Object.keys(this.configuration).length === 0) {
      return {};
    }

    return {
      account: this.configuration.account,
      namespace: this.configuration.namespace,
      token: 't***n',
    };
  }

  match(container: any) {
    return container?.registry?.url?.includes('quay.io') || false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'quay',
        url: 'https://quay.io/test/image/v2',
      },
    };
  }

  async authenticate(image: any, options: any = { headers: {} }) {
    if (Object.keys(this.configuration).length === 0) {
      return {
        headers: {},
      };
    }

    return {
      headers: {
        Authorization: 'Bearer token',
      },
    };
  }

  getAuthCredentials() {
    if (Object.keys(this.configuration).length === 0) {
      return undefined;
    }

    return 'bmFtZXNwYWNlK2FjY291bnQ6dG9rZW4=';
  }

  getAuthPull() {
    if (Object.keys(this.configuration).length === 0) {
      return undefined;
    }

    return {
      password: this.configuration.token,
      username: `${this.configuration.namespace}+${this.configuration.account}`,
    };
  }
}

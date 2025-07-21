import { vi } from 'vitest';

export class GcrRegistryComponent {
  configuration = {
    clientemail: 'accesskeyid',
    privatekey: 'secretaccesskey',
  };
  name = 'gcr';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  validateConfiguration(config: any) {
    if (!config.clientemail) {
      throw new Error('"clientemail" is required');
    }
    if (!config.privatekey) {
      throw new Error('"privatekey" is required');
    }
    return config;
  }

  maskConfiguration() {
    return {
      clientemail: 'accesskeyid',
      privatekey: 's*************y',
    };
  }

  match(container: any) {
    return container?.registry?.url?.includes('gcr.io') || false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'gcr',
        url: `https://${image.registry.url}/v2`,
      },
    };
  }

  async authenticate() {
    return {
      headers: {
        Authorization: 'Bearer xxxxx',
      },
    };
  }
}

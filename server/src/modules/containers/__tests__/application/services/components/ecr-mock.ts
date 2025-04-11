import { vi } from 'vitest';

export class EcrRegistryComponent {
  configuration = {
    accesskeyid: 'accesskeyid',
    secretaccesskey: 'secretaccesskey',
    region: 'eu-west-1',
  };
  name = 'ecr';
  childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };

  validateConfiguration(config: any) {
    if (!config.accesskeyid) {
      throw new Error('"accesskeyid" is required');
    }
    if (!config.secretaccesskey) {
      throw new Error('"secretaccesskey" is required');
    }
    if (!config.region) {
      throw new Error('"region" is required');
    }
    return config;
  }

  maskConfiguration() {
    return {
      accesskeyid: 'a*********d',
      secretaccesskey: 's*************y',
      region: 'region',
    };
  }

  match(container: any) {
    if (
      container?.registry?.url?.includes('ecr.') &&
      container?.registry?.url?.includes('amazonaws.com')
    ) {
      return true;
    }
    return false;
  }

  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'ecr',
        url: `https://${image.registry.url}/v2`,
      },
    };
  }

  async authenticate() {
    return {
      headers: {
        Authorization: 'Basic xxxxx',
      },
    };
  }
}

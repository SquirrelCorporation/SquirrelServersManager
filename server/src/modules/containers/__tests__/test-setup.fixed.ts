import { vi } from 'vitest';

/* Mock registry components */
vi.mock(
  '@modules/containers/application/services/components/registry/acr-registry.component',
  () => {
    return {
      AcrRegistryComponent: class AcrRegistryComponent {
        configuration = {
          clientid: 'clientid',
          clientsecret: 'clientsecret',
        };
        name = 'acr';
        validateConfiguration = vi.fn().mockImplementation((config) => {
          if (!config.clientid) {
            throw new Error('"clientid" is required');
          }
          if (!config.clientsecret) {
            throw new Error('"clientsecret" is required');
          }
          return config;
        });
        maskConfiguration = vi.fn().mockReturnValue({
          clientid: 'clientid',
          clientsecret: 'c**********t',
        });
        match = vi.fn().mockImplementation((container) => {
          if (container.registry?.url?.includes('azurecr.io')) {
            return true;
          }
          return false;
        });
        normalizeImage = vi.fn().mockImplementation((image) => {
          return {
            ...image,
            registry: {
              name: 'acr',
              url: `https://${image.registry.url}/v2`,
            },
          };
        });
        authenticate = vi.fn().mockResolvedValue({
          headers: {
            Authorization: 'Basic Y2xpZW50aWQ6Y2xpZW50c2VjcmV0',
          },
        });
      },
    };
  },
);

/* Mock ECR registry component */
vi.mock(
  '@modules/containers/application/services/components/registry/ecr-registry.component',
  () => {
    return {
      EcrRegistryComponent: class EcrRegistryComponent {
        name = 'ecr';
      },
    };
  },
);

/* Mock GCR registry component */
vi.mock(
  '@modules/containers/application/services/components/registry/gcr-registry.component',
  () => {
    return {
      GcrRegistryComponent: class GcrRegistryComponent {
        name = 'gcr';
      },
    };
  },
);

/* Mock Docker Hub registry component */
vi.mock(
  '@modules/containers/application/services/components/registry/docker-hub-registry.component',
  () => {
    return {
      DockerHubRegistryComponent: class DockerHubRegistryComponent {
        name = 'hub';
      },
    };
  },
);

/* Mock registry utilities */
vi.mock('@modules/containers/application/services/components/core/WatcherEngine', () => {
  return {
    getRegistries: vi.fn().mockReturnValue({
      acr: {},
      ecr: {},
      gcr: {},
      hub: {},
    }),
  };
});

// Mock ECR registry component
export class EcrRegistryComponent {
  name = 'ecr';
  match(container: any) {
    return container?.registry?.url?.includes('ecr.') || false;
  }
}

// Mock GCR registry component
export class GcrRegistryComponent {
  name = 'gcr';
  match(container: any) {
    return container?.registry?.url?.includes('gcr.io') || false;
  }
}

// Mock Docker Hub registry component
export class DockerHubRegistryComponent {
  name = 'hub';
  match() {
    return true;
  }
}

// Mock registry utils
export function getRegistries() {
  return {
    acr: {},
    ecr: {},
    gcr: {},
    hub: {},
  };
}

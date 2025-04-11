// Mock AcrRegistryComponent class
export class AcrRegistryComponent {
  configuration = {
    clientid: 'clientid',
    clientsecret: 'clientsecret',
  };
  name = 'acr';
  
  validateConfiguration(config: any) {
    if (!config.clientid) {
      throw new Error('"clientid" is required');
    }
    if (!config.clientsecret) {
      throw new Error('"clientsecret" is required');
    }
    return config;
  }
  
  maskConfiguration() {
    return {
      clientid: 'clientid',
      clientsecret: 'c**********t',
    };
  }
  
  match(container: any) {
    return container?.registry?.url?.includes('azurecr.io') || false;
  }
  
  normalizeImage(image: any) {
    return {
      ...image,
      registry: {
        name: 'acr',
        url: `https://${image.registry.url}/v2`,
      },
    };
  }
  
  async authenticate() {
    return {
      headers: {
        Authorization: 'Basic Y2xpZW50aWQ6Y2xpZW50c2VjcmV0',
      },
    };
  }
}

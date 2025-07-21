import { beforeEach, describe, expect, it } from 'vitest';

// Simplified AnsibleGalaxyCommandService for testing
class AnsibleGalaxyCommandService {
  private static readonly ansibleGalaxy = 'ansible-galaxy';
  private static readonly collection = 'collection';

  getInstallCollectionCmd(name: string, namespace: string): string {
    return `${AnsibleGalaxyCommandService.ansibleGalaxy} ${AnsibleGalaxyCommandService.collection} install ${namespace}.${name}`;
  }

  getListCollectionsCmd(): string {
    return `${AnsibleGalaxyCommandService.ansibleGalaxy} ${AnsibleGalaxyCommandService.collection} list`;
  }
}

describe('AnsibleGalaxyCommandService', () => {
  let service: AnsibleGalaxyCommandService;

  beforeEach(() => {
    service = new AnsibleGalaxyCommandService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInstallCollectionCmd', () => {
    it('should return the correct command to install a collection', () => {
      const name = 'test-collection';
      const namespace = 'test-namespace';

      const result = service.getInstallCollectionCmd(name, namespace);

      expect(result).toBe('ansible-galaxy collection install test-namespace.test-collection');
    });
  });

  describe('getListCollectionsCmd', () => {
    it('should return the correct command to list collections', () => {
      const result = service.getListCollectionsCmd();

      expect(result).toBe('ansible-galaxy collection list');
    });
  });
});

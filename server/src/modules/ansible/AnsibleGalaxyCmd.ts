import { ModuleRef } from '@nestjs/core';
import { AnsibleGalaxyCommandService } from './services/ansible-galaxy-command.service';

/**
 * This is a bridge class that provides a static interface to the AnsibleGalaxyCommandService
 * for backward compatibility with existing code.
 */
class AnsibleGalaxyCmd {
  private static ansibleGalaxyCommandService: AnsibleGalaxyCommandService;
  private static moduleRef: ModuleRef;

  /**
   * Set the ModuleRef to allow access to the NestJS dependency injection container
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    AnsibleGalaxyCmd.moduleRef = moduleRef;
  }

  /**
   * Get the AnsibleGalaxyCommandService instance
   */
  private static getService(): AnsibleGalaxyCommandService {
    if (!AnsibleGalaxyCmd.ansibleGalaxyCommandService) {
      if (!AnsibleGalaxyCmd.moduleRef) {
        throw new Error('ModuleRef not set in AnsibleGalaxyCmd');
      }
      AnsibleGalaxyCmd.ansibleGalaxyCommandService = AnsibleGalaxyCmd.moduleRef.get(
        AnsibleGalaxyCommandService,
        { strict: false },
      );
    }
    return AnsibleGalaxyCmd.ansibleGalaxyCommandService;
  }

  /**
   * Get install collection command
   */
  static getInstallCollectionCmd(name: string, namespace: string): string {
    return AnsibleGalaxyCmd.getService().getInstallCollectionCmd(name, namespace);
  }

  /**
   * Get list collections command
   */
  static getListCollectionsCmd(name: string, namespace: string): string {
    return AnsibleGalaxyCmd.getService().getListCollectionsCmd(name, namespace);
  }
}

export default AnsibleGalaxyCmd;

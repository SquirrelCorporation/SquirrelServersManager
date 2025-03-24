import { Injectable } from '@nestjs/common';
import { IAnsibleGalaxyCommandService } from '@modules/ansible/application/interfaces/ansible-galaxy-command-service.interface';
/**
 * Service for building Ansible Galaxy commands
 */
@Injectable()
export class AnsibleGalaxyCommandService implements IAnsibleGalaxyCommandService {
  private static readonly ansibleGalaxy = 'ansible-galaxy';
  private static readonly collection = 'collection';

  /**
   * Get command to install an Ansible collection
   */
  getInstallCollectionCmd(name: string, namespace: string): string {
    return `${AnsibleGalaxyCommandService.ansibleGalaxy} ${AnsibleGalaxyCommandService.collection} install ${namespace}.${name}`;
  }

  /**
   * Get command to list Ansible collections
   */
  getListCollectionsCmd(): string {
    return `${AnsibleGalaxyCommandService.ansibleGalaxy} ${AnsibleGalaxyCommandService.collection} list`;
  }
}

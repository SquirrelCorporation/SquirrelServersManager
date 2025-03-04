import { Injectable } from '@nestjs/common';
import { ShellWrapperService } from '../../shell/services/shell-wrapper.service';

/**
 * Service for building Ansible Galaxy commands
 */
@Injectable()
export class AnsibleGalaxyCommandService {
  private static readonly ansibleGalaxy = 'ansible-galaxy';
  private static readonly collection = 'collection';

  constructor(private readonly shellWrapperService: ShellWrapperService) {}

  /**
   * Get command to install an Ansible collection
   */
  getInstallCollectionCmd(name: string, namespace: string): string {
    return `${AnsibleGalaxyCommandService.ansibleGalaxy} ${AnsibleGalaxyCommandService.collection} install ${namespace}.${name}`;
  }

  /**
   * Get command to list Ansible collections
   */
  getListCollectionsCmd(name: string, namespace: string): string {
    return `${AnsibleGalaxyCommandService.ansibleGalaxy} ${AnsibleGalaxyCommandService.collection} list`;
  }

  /**
   * Install an Ansible collection
   */
  async installCollection(name: string, namespace: string): Promise<void> {
    const cmd = this.getInstallCollectionCmd(name, namespace);
    await this.shellWrapperService.exec(cmd);
  }
}
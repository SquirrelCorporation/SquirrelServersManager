import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AnsibleGalaxyCommandService } from './ansible-galaxy-command.service';

@Injectable()
export class GalaxyService {
  private readonly galaxyApiUrl = 'https://galaxy.ansible.com/api/v2';

  constructor(
    private readonly httpService: HttpService,
    private readonly ansibleGalaxyCommandService: AnsibleGalaxyCommandService,
  ) {}

  /**
   * Get collections from Ansible Galaxy
   */
  async getCollections(page = 1, pageSize = 10, search?: string) {
    const params: Record<string, string | number> = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const url = `${this.galaxyApiUrl}/collections/`;
    const response = await firstValueFrom(
      this.httpService.get(url, { params }),
    );

    return response.data;
  }

  /**
   * Get a specific collection from Ansible Galaxy
   */
  async getCollection(namespace: string, name: string, version?: string) {
    let url = `${this.galaxyApiUrl}/collections/${namespace}/${name}/`;
    if (version) {
      url += `versions/${version}/`;
    }

    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  /**
   * Install a collection from Ansible Galaxy
   */
  async installCollection(namespace: string, name: string) {
    try {
      await this.ansibleGalaxyCommandService.installCollection(name, namespace);
      return { success: true, message: `Successfully installed ${namespace}.${name}` };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Failed to install ${namespace}.${name}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
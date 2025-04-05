import { IGalaxyService } from '@modules/ansible/doma../../domain/interfaces/galaxy-service.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AnsibleCommandService } from './ansible-command.service';

/**
 * Service for managing Ansible Galaxy collections and roles
 */
@Injectable()
export class GalaxyService implements IGalaxyService {
  private readonly logger = new Logger(GalaxyService.name);
  private readonly galaxyApiUrl = 'https://galaxy.ansible.com/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly ansibleCommandService: AnsibleCommandService,
  ) {}

  /**
   * Search for collections in Ansible Galaxy
   * @returns List of matching collections
   */
  async getAnsibleGalaxyCollections(
    offset: number,
    pageSize: number,
    current: number,
    namespace?: string,
    content?: string,
  ): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.galaxyApiUrl}/v3/plugin/ansible/search/collection-versions/?${namespace ? 'namespace=' + encodeURIComponent(namespace) + '&' : ''}${content ? 'keywords=' + encodeURIComponent(content) + '&' : ''}is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=${offset}&limit=${pageSize}&order_by=name`,
        ),
      );
      this.logger.log(response);
      return {
        data: response.data?.data || [],
        metadata: {
          total: response.data?.meta?.count,
          pageSize,
          current,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error searching Galaxy collections: ${error.message}`);
      throw error;
    }
  }

  async getAnsibleGalaxyCollection(
    namespace?: string,
    name?: string,
    version?: string,
  ): Promise<any> {
    if (!namespace || !name) {
      throw new Error('Namespace and name are required');
    }

    const response = await lastValueFrom(
      this.httpService.get(
        `${this.galaxyApiUrl}/pulp/api/v3/content/ansible/collection_versions/?namespace=${encodeURIComponent(namespace)}&name=${encodeURIComponent(name)}${version ? '&version=' + encodeURIComponent(version) : ''}&offset=0&limit=10`,
      ),
    );
    return response.data?.results ? response.data.results[0] : undefined;
  }
  /**
   * Install a collection from Ansible Galaxy
   * @param namespace - The collection namespace
   * @param name - The collection name
   * @returns The installation result
   */
  async installCollection(namespace: string, name: string): Promise<void> {
    try {
      await this.ansibleCommandService.installAnsibleGalaxyCollection(name, namespace);
    } catch (error: any) {
      this.logger.error(`Error installing Galaxy collection: ${error.message}`);
      throw error;
    }
  }
}

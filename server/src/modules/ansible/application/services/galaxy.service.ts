import { IGalaxyService } from '@modules/ansible/domain/interfaces/galaxy-service.interface';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  ANSIBLE_COMMAND_SERVICE,
  IAnsibleCommandService,
} from '../../domain/interfaces/ansible-command-service.interface';
import {
  CollectionDetailsResponseDto,
  CollectionsPaginatedResponseDto,
} from '../../presentation/dtos/galaxy-response.dto';

/**
 * Service for managing Ansible Galaxy collections and roles
 */
@Injectable()
export class GalaxyService implements IGalaxyService {
  private readonly logger = new Logger(GalaxyService.name);
  private readonly GALAXY_API_URL = 'https://galaxy.ansible.com/api';

  constructor(
    private readonly httpService: HttpService,
    @Inject(ANSIBLE_COMMAND_SERVICE)
    private readonly ansibleCommandService: IAnsibleCommandService,
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
  ): Promise<CollectionsPaginatedResponseDto> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.GALAXY_API_URL}/v3/plugin/ansible/search/collection-versions/?${namespace ? 'namespace=' + encodeURIComponent(namespace) + '&' : ''}${content ? 'keywords=' + encodeURIComponent(content) + '&' : ''}is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=${offset}&limit=${pageSize}&order_by=name`,
        ),
      );
      return {
        data: response.data?.data || [],
        success: true,
        total: response.data?.meta?.count || 0,
        pageSize,
        current,
      };
    } catch (error) {
      this.logger.error(
        `Error searching Galaxy collections: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getAnsibleGalaxyCollection(
    namespace?: string,
    name?: string,
    version?: string,
  ): Promise<CollectionDetailsResponseDto> {
    if (!namespace || !name) {
      throw new Error('Namespace and name are required');
    }

    const response = await lastValueFrom(
      this.httpService.get(
        `${this.GALAXY_API_URL}/pulp/api/v3/content/ansible/collection_versions/?namespace=${encodeURIComponent(namespace)}&name=${encodeURIComponent(name)}${version ? '&version=' + encodeURIComponent(version) : ''}&offset=0&limit=10`,
      ),
    );
    if (!response.data?.results || response.data.results.length === 0) {
      throw new Error(`Collection ${namespace}.${name} not found`);
    }
    return response.data.results[0];
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
    } catch (error) {
      this.logger.error(
        `Error installing Galaxy collection: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}

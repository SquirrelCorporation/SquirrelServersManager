import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { SSM_INSTALL_PATH } from '../../../../config';
import { ShellWrapperService } from '../../../shell';

/**
 * Service for managing Ansible Galaxy collections and roles
 */
@Injectable()
export class GalaxyService {
  private readonly logger = new Logger(GalaxyService.name);
  private readonly galaxyApiUrl = 'https://galaxy.ansible.com/api/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly shellWrapperService: ShellWrapperService,
  ) {}

  /**
   * Search for collections in Ansible Galaxy
   * @param query - The search query
   * @returns List of matching collections
   */
  async searchCollections(query: string): Promise<any[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.galaxyApiUrl}/search/collection/?keywords=${query}`)
      );
      return response.data.results || [];
    } catch (error: any) {
      this.logger.error(`Error searching Galaxy collections: ${error.message}`);
      throw error;
    }
  }

  /**
   * Install a collection from Ansible Galaxy
   * @param namespace - The collection namespace
   * @param name - The collection name
   * @param version - The collection version (optional)
   * @returns The installation result
   */
  async installCollection(namespace: string, name: string, version?: string): Promise<string> {
    try {
      const collectionRef = `${namespace}.${name}${version ? ':' + version : ''}`;
      const command = `ansible-galaxy collection install ${collectionRef} -f` + `${SSM_INSTALL_PATH}/ansible`;

      this.logger.log(`Installing collection: ${collectionRef}`);
      return await this.shellWrapperService.exec(command);
    } catch (error: any) {
      this.logger.error(`Error installing Galaxy collection: ${error.message}`);
      throw error;
    }
  }

  /**
   * List installed collections
   * @returns List of installed collections
   */
  async listInstalledCollections(): Promise<any[]> {
    try {
      const command = 'ansible-galaxy collection list --format json' + `${SSM_INSTALL_PATH}/ansible`;
      const result = await this.shellWrapperService.exec(command);

      return JSON.parse(result);
    } catch (error: any) {
      this.logger.error(`Error listing installed collections: ${error.message}`);
      return [];
    }
  }
}
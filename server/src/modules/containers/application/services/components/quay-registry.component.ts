import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'QuayRegistryComponent' }, { msgPrefix: '[QUAY_REGISTRY] - ' });

/**
 * Quay.io Container Registry implementation
 */
@Injectable()
export class QuayRegistryComponent extends AbstractRegistryComponent {
  private baseUrl = 'https://quay.io';
  private apiUrl = 'https://quay.io/api/v1';
  private token: string | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up Quay.io registry: ${this.name}`);
    
    // Check if we have credentials
    if (this.configuration.namespace && this.configuration.account && this.configuration.token) {
      try {
        // Test authentication
        await this.testConnection();
        logger.info(`Successfully authenticated with Quay.io as ${this.configuration.namespace}+${this.configuration.account}`);
      } catch (error) {
        logger.error(`Failed to authenticate with Quay.io: ${error.message}`);
        // Don't throw - we'll try to use anonymous access
      }
    } else {
      logger.info('Using anonymous access to Quay.io (limited to public repositories)');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up Quay.io registry: ${this.name}`);
    this.token = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating Quay.io registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    
    // Test with new configuration
    if (this.configuration.namespace && this.configuration.account && this.configuration.token) {
      try {
        await this.testConnection();
        logger.info(`Successfully re-authenticated with Quay.io as ${this.configuration.namespace}+${this.configuration.account}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with Quay.io: ${error.message}`);
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      const namespace = this.configuration.namespace || 'library';
      
      // Get repositories for the namespace
      const response = await axios.get(
        `${this.apiUrl}/repository?namespace=${namespace}`,
        this.getAuthHeaders()
      );
      
      const repositories = response.data.repositories || [];
      const result = [];
      
      // Get tags for each repository
      for (const repo of repositories) {
        try {
          const tagsResponse = await axios.get(
            `${this.apiUrl}/repository/${namespace}/${repo.name}/tag/`,
            this.getAuthHeaders()
          );
          
          result.push({
            name: `${namespace}/${repo.name}`,
            description: repo.description,
            tags: tagsResponse.data.tags.map(tag => tag.name),
            popularity: repo.popularity,
            isPublic: repo.is_public,
            lastModified: repo.last_modified,
          });
        } catch (error) {
          logger.error(`Failed to get tags for repository ${repo.name}: ${error.message}`);
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to list Quay.io images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      // Use Quay.io search API
      const response = await axios.get(
        `${this.apiUrl}/find/repositories?query=${encodeURIComponent(query)}`,
        this.getAuthHeaders()
      );
      
      return response.data.results.map(repo => ({
        name: repo.path,
        description: repo.description,
        isPublic: !repo.is_private,
        lastModified: repo.last_modified,
      }));
    } catch (error) {
      logger.error(`Failed to search Quay.io images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      // Parse image name to get namespace and repository
      let namespace = this.configuration.namespace || 'library';
      let repository = imageName;
      
      if (imageName.includes('/')) {
        const parts = imageName.split('/');
        namespace = parts[0];
        repository = parts[1];
      }
      
      // Get repository info
      const repoResponse = await axios.get(
        `${this.apiUrl}/repository/${namespace}/${repository}`,
        this.getAuthHeaders()
      );
      
      // Get tag info
      const tagResponse = await axios.get(
        `${this.apiUrl}/repository/${namespace}/${repository}/tag/${tag}/images`,
        this.getAuthHeaders()
      );
      
      // Get manifest from Docker Registry API
      const manifestResponse = await axios.get(
        `${this.baseUrl}/v2/${namespace}/${repository}/manifests/${tag}`,
        {
          ...this.getAuthHeaders(),
          headers: {
            ...this.getAuthHeaders().headers,
            Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          },
        }
      );
      
      return {
        name: `${namespace}/${repository}`,
        tag,
        description: repoResponse.data.description,
        isPublic: repoResponse.data.is_public,
        lastModified: repoResponse.data.last_modified,
        size: tagResponse.data.images[0]?.size || 0,
        digest: manifestResponse.headers['docker-content-digest'],
        layers: manifestResponse.data.layers?.length || 0,
      };
    } catch (error) {
      logger.error(`Failed to get Quay.io image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.configuration.namespace && this.configuration.account && this.configuration.token) {
        // Try to access API with authentication
        const credentials = this.getBasicAuthCredentials();
        const response = await axios.get(
          `${this.apiUrl}/user/`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        
        // Check if response has user information
        return response.data && response.data.organizations !== undefined;
      }
      
      // For anonymous access, try a basic API call
      await axios.get(`${this.apiUrl}/repository?public=true&page=1&page_size=1`);
      return true;
    } catch (error) {
      logger.error(`Quay.io connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Base64 encoded credentials for Quay.io
   */
  private getBasicAuthCredentials(): string {
    const username = `${this.configuration.namespace}+${this.configuration.account}`;
    const password = this.configuration.token;
    return Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');
  }

  /**
   * Get headers with authentication token
   */
  private getAuthHeaders(): any {
    if (this.configuration.namespace && this.configuration.account && this.configuration.token) {
      const credentials = this.getBasicAuthCredentials();
      return {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
      };
    }
    
    return {
      headers: {
        Accept: 'application/json',
      },
    };
  }

  /**
   * Get repository access token for a specific repository
   */
  private async getRepositoryToken(namespace: string, repository: string): Promise<string> {
    try {
      const credentials = this.getBasicAuthCredentials();
      const response = await axios.get(
        `${this.baseUrl}/v2/auth?service=quay.io&scope=repository:${namespace}/${repository}:pull`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${credentials}`,
          },
        }
      );
      
      return response.data.token;
    } catch (error) {
      logger.error(`Failed to get repository token: ${error.message}`);
      throw error;
    }
  }
}
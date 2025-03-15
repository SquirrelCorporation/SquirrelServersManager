import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'DockerHubRegistryComponent' }, { msgPrefix: '[DOCKER_HUB_REGISTRY] - ' });

/**
 * Docker Hub registry implementation
 */
@Injectable()
export class DockerHubRegistryComponent extends AbstractRegistryComponent {
  private baseUrl = 'https://hub.docker.com/v2';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up Docker Hub registry: ${this.name}`);
    
    // Check if we need to authenticate
    if (this.configuration.username && this.configuration.password) {
      try {
        await this.authenticate();
        logger.info(`Successfully authenticated with Docker Hub as ${this.configuration.username}`);
      } catch (error) {
        logger.error(`Failed to authenticate with Docker Hub: ${error.message}`);
        // Don't throw - we'll try to use anonymous access
      }
    } else {
      logger.info('Using anonymous access to Docker Hub');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up Docker Hub registry: ${this.name}`);
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating Docker Hub registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    this.tokenExpiry = null;
    
    // Re-authenticate if credentials are provided
    if (this.configuration.username && this.configuration.password) {
      try {
        await this.authenticate();
        logger.info(`Successfully re-authenticated with Docker Hub as ${this.configuration.username}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with Docker Hub: ${error.message}`);
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      // If username is provided, list user repositories
      if (this.configuration.username) {
        await this.ensureAuthenticated();
        const response = await axios.get(
          `${this.baseUrl}/repositories/${this.configuration.username}`,
          this.getAuthHeaders()
        );
        return response.data.results.map(this.formatRepositoryInfo);
      }
      
      // Otherwise, list popular repositories
      const response = await axios.get(`${this.baseUrl}/repositories/library`);
      return response.data.results.map(this.formatRepositoryInfo);
    } catch (error) {
      logger.error(`Failed to list images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      // Ensure we're authenticated if credentials are provided
      if (this.configuration.username && this.configuration.password) {
        await this.ensureAuthenticated();
      }
      
      const response = await axios.get(
        `${this.baseUrl}/search/repositories`,
        {
          ...this.getAuthHeaders(),
          params: {
            query,
            page: 1,
            page_size: 25,
          },
        }
      );
      
      return response.data.results.map(this.formatSearchResult);
    } catch (error) {
      logger.error(`Failed to search images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      // Parse image name to get namespace and repository
      let namespace = 'library';
      let repository = imageName;
      
      if (imageName.includes('/')) {
        const parts = imageName.split('/');
        namespace = parts[0];
        repository = parts[1];
      }
      
      // Ensure we're authenticated if credentials are provided
      if (this.configuration.username && this.configuration.password) {
        await this.ensureAuthenticated();
      }
      
      // Get repository info
      const repoResponse = await axios.get(
        `${this.baseUrl}/repositories/${namespace}/${repository}`,
        this.getAuthHeaders()
      );
      
      // Get tag info
      const tagResponse = await axios.get(
        `${this.baseUrl}/repositories/${namespace}/${repository}/tags/${tag}`,
        this.getAuthHeaders()
      );
      
      return {
        ...this.formatRepositoryInfo(repoResponse.data),
        tag: {
          name: tagResponse.data.name,
          lastUpdated: tagResponse.data.last_updated,
          images: tagResponse.data.images,
        },
      };
    } catch (error) {
      logger.error(`Failed to get image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.configuration.username && this.configuration.password) {
        // Try to authenticate
        await this.authenticate();
        return true;
      }
      
      // For anonymous access, just try to access the API
      await axios.get(`${this.baseUrl}/repositories/library/ubuntu`);
      return true;
    } catch (error) {
      logger.error(`Connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Authenticate with Docker Hub
   */
  private async authenticate(): Promise<void> {
    try {
      const { username, password } = this.configuration;
      
      if (!username || !password) {
        throw new Error('Username and password are required for authentication');
      }
      
      const response = await axios.post(`${this.baseUrl}/users/login`, {
        username,
        password,
      });
      
      this.token = response.data.token;
      
      // Set token expiry to 24 hours from now (Docker Hub tokens typically last 24 hours)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      this.tokenExpiry = expiryTime;
    } catch (error) {
      logger.error(`Authentication failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensure we're authenticated
   */
  private async ensureAuthenticated(): Promise<void> {
    // Check if we need to authenticate
    if (!this.token || (this.tokenExpiry && new Date() > this.tokenExpiry)) {
      await this.authenticate();
    }
  }

  /**
   * Get headers with authentication token
   */
  private getAuthHeaders(): any {
    if (this.token) {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };
    }
    
    return {};
  }

  /**
   * Format repository information
   */
  private formatRepositoryInfo(repo: any): any {
    return {
      name: repo.name,
      namespace: repo.namespace,
      description: repo.description,
      starCount: repo.star_count,
      pullCount: repo.pull_count,
      lastUpdated: repo.last_updated,
      isOfficial: repo.is_official,
      isPrivate: repo.is_private,
    };
  }

  /**
   * Format search result
   */
  private formatSearchResult(result: any): any {
    return {
      name: result.repo_name,
      description: result.short_description,
      starCount: result.star_count,
      isOfficial: result.is_official,
      isAutomated: result.is_automated,
    };
  }
}
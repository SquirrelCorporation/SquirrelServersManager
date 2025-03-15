import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'GhcrRegistryComponent' }, { msgPrefix: '[GHCR_REGISTRY] - ' });

/**
 * GitHub Container Registry implementation
 */
@Injectable()
export class GhcrRegistryComponent extends AbstractRegistryComponent {
  private baseUrl = 'https://ghcr.io';
  private apiUrl = 'https://api.github.com';
  private token: string | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up GitHub Container Registry: ${this.name}`);
    
    // Check if we have credentials
    if (this.configuration.username && this.configuration.token) {
      try {
        // Store the token for later use
        this.token = this.configuration.token;
        
        // Validate token with a simple API call
        await this.testConnection();
        logger.info(`Successfully authenticated with GHCR as ${this.configuration.username}`);
      } catch (error) {
        logger.error(`Failed to authenticate with GHCR: ${error.message}`);
        this.token = null;
        // Don't throw - we'll try to use anonymous access
      }
    } else {
      logger.info('Using anonymous access to GHCR (limited to public images)');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up GHCR registry: ${this.name}`);
    this.token = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating GHCR registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    
    // Re-authenticate if credentials are provided
    if (this.configuration.username && this.configuration.token) {
      try {
        // Store the token for later use
        this.token = this.configuration.token;
        
        // Validate token with a simple API call
        await this.testConnection();
        logger.info(`Successfully re-authenticated with GHCR as ${this.configuration.username}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with GHCR: ${error.message}`);
        this.token = null;
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      const username = this.configuration.username;
      
      if (!username) {
        logger.warn('No username provided, cannot list GHCR images');
        return [];
      }
      
      // Use GitHub API to get user's packages
      const response = await axios.get(
        `${this.apiUrl}/users/${username}/packages?package_type=container`,
        this.getAuthHeaders()
      );
      
      // Transform the response to match our expected format
      return response.data.map(pkg => this.formatPackageInfo(pkg));
    } catch (error) {
      logger.error(`Failed to list GHCR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   * Note: GitHub API doesn't have a dedicated search for container images
   * Instead, we use the packages search endpoint
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      // Using GitHub's search API to find packages
      // Note: This will search across all of GitHub, not just a user's packages
      const response = await axios.get(
        `${this.apiUrl}/search/packages?q=${encodeURIComponent(query)}+type:container`,
        this.getAuthHeaders()
      );
      
      // Transform the response to match our expected format
      return response.data.items.map(pkg => this.formatSearchResult(pkg));
    } catch (error) {
      logger.error(`Failed to search GHCR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      // Parse image name to get owner and package name
      let owner = this.configuration.username;
      let packageName = imageName;
      
      if (imageName.includes('/')) {
        const parts = imageName.split('/');
        owner = parts[0];
        packageName = parts[parts.length - 1];
      }
      
      if (!owner) {
        throw new Error('Owner must be specified for GHCR image info');
      }
      
      // Get package info from GitHub API
      const packageResponse = await axios.get(
        `${this.apiUrl}/users/${owner}/packages/container/${packageName}`,
        this.getAuthHeaders()
      );
      
      // Get package versions
      const versionsResponse = await axios.get(
        `${this.apiUrl}/users/${owner}/packages/container/${packageName}/versions`,
        this.getAuthHeaders()
      );
      
      // Find the specific version/tag
      const version = versionsResponse.data.find(v => 
        v.metadata?.container?.tags?.includes(tag)
      );
      
      return {
        name: `${owner}/${packageName}`,
        tag,
        description: packageResponse.data.description || '',
        createdAt: version?.created_at || packageResponse.data.created_at,
        updatedAt: version?.updated_at || packageResponse.data.updated_at,
        packageType: packageResponse.data.package_type,
        visibility: packageResponse.data.visibility,
        versionId: version?.id,
        size: version?.metadata?.container?.size,
      };
    } catch (error) {
      logger.error(`Failed to get GHCR image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.token) {
        // Try to authenticate with the GitHub API
        await axios.get(`${this.apiUrl}/user`, this.getAuthHeaders());
        return true;
      }
      
      // For anonymous access, try a basic API call
      await axios.get(`${this.apiUrl}/rate_limit`);
      return true;
    } catch (error) {
      logger.error(`GHCR connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get headers with authentication token
   */
  private getAuthHeaders(): any {
    if (this.token) {
      return {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      };
    }
    
    return {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    };
  }

  /**
   * Format package information
   */
  private formatPackageInfo(pkg: any): any {
    return {
      name: pkg.name,
      owner: pkg.owner?.login,
      packageType: pkg.package_type,
      visibility: pkg.visibility,
      url: pkg.html_url,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      versionCount: pkg.version_count,
    };
  }

  /**
   * Format search result
   */
  private formatSearchResult(pkg: any): any {
    return {
      name: pkg.name,
      owner: pkg.repository?.owner?.login,
      description: pkg.description,
      packageType: pkg.package_type,
      url: pkg.html_url,
      visibility: pkg.visibility,
    };
  }
}
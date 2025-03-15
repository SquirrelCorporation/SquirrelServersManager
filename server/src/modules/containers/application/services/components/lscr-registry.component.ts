import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'LscrRegistryComponent' }, { msgPrefix: '[LSCR_REGISTRY] - ' });

/**
 * Linux Server Container Registry implementation
 * Based on GitHub Container Registry but with specific configuration
 */
@Injectable()
export class LscrRegistryComponent extends AbstractRegistryComponent {
  private baseUrl = 'https://lscr.io';
  private apiUrl = 'https://api.github.com';
  private token: string | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up Linux Server Container Registry: ${this.name}`);
    
    // Check if we have credentials
    if (this.configuration.username && this.configuration.token) {
      try {
        // Validate token with a simple API call
        await this.testConnection();
        logger.info(`Successfully authenticated with LSCR as ${this.configuration.username}`);
      } catch (error) {
        logger.error(`Failed to authenticate with LSCR: ${error.message}`);
        this.token = null;
        // Don't throw - we'll try to use anonymous access
      }
    } else {
      logger.info('Using anonymous access to LSCR (limited to public images)');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up LSCR registry: ${this.name}`);
    this.token = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating LSCR registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    
    // Re-authenticate if credentials are provided
    if (this.configuration.username && this.configuration.token) {
      try {
        // Validate token with a simple API call
        await this.testConnection();
        logger.info(`Successfully re-authenticated with LSCR as ${this.configuration.username}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with LSCR: ${error.message}`);
        this.token = null;
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      // LSCR is specifically for the LinuxServer.io organization
      const organization = 'linuxserver';
      
      // Use GitHub API to get packages
      const response = await axios.get(
        `${this.apiUrl}/orgs/${organization}/packages?package_type=container`,
        this.getAuthHeaders()
      );
      
      // Transform the response to match our expected format
      return response.data.map(pkg => this.formatPackageInfo(pkg));
    } catch (error) {
      logger.error(`Failed to list LSCR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      // Using GitHub's search API to find LinuxServer packages
      const response = await axios.get(
        `${this.apiUrl}/search/packages?q=${encodeURIComponent(query)}+org:linuxserver+type:container`,
        this.getAuthHeaders()
      );
      
      // Transform the response to match our expected format
      return response.data.items.map(pkg => this.formatSearchResult(pkg));
    } catch (error) {
      logger.error(`Failed to search LSCR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      // Parse image name to get package name (removing the linuxserver/ prefix if present)
      let packageName = imageName;
      if (imageName.startsWith('linuxserver/')) {
        packageName = imageName.substring('linuxserver/'.length);
      }
      
      // Get package info from GitHub API
      const packageResponse = await axios.get(
        `${this.apiUrl}/orgs/linuxserver/packages/container/${packageName}`,
        this.getAuthHeaders()
      );
      
      // Get package versions
      const versionsResponse = await axios.get(
        `${this.apiUrl}/orgs/linuxserver/packages/container/${packageName}/versions`,
        this.getAuthHeaders()
      );
      
      // Find the specific version/tag
      const version = versionsResponse.data.find(v => 
        v.metadata?.container?.tags?.includes(tag)
      );
      
      return {
        name: `linuxserver/${packageName}`,
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
      logger.error(`Failed to get LSCR image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.configuration.username && this.configuration.token) {
        // Try to authenticate with the GitHub API
        const response = await axios.get(
          `${this.apiUrl}/user`,
          this.getAuthHeaders()
        );
        
        return response.data && response.data.login !== undefined;
      }
      
      // For anonymous access, check if we can access the LinuxServer organization
      const response = await axios.get(`${this.apiUrl}/orgs/linuxserver`);
      return response.data && response.data.login === 'linuxserver';
    } catch (error) {
      logger.error(`LSCR connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get authentication headers for GitHub API
   */
  private getAuthHeaders(): any {
    if (this.configuration.username && this.configuration.token) {
      // For GitHub API, we use token authentication
      return {
        headers: {
          Authorization: `token ${this.configuration.token}`,
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
   * Get authentication credentials for Docker Registry API
   */
  private getAuthCredentials(): any {
    if (this.configuration.username && this.configuration.token) {
      // For Docker Registry API, we use Basic authentication
      return {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.configuration.username}:${this.configuration.token}`, 'utf-8').toString('base64')}`,
        },
      };
    }
    
    return {};
  }

  /**
   * Format package information
   */
  private formatPackageInfo(pkg: any): any {
    return {
      name: `linuxserver/${pkg.name}`,
      description: pkg.description || '',
      url: pkg.html_url,
      createdAt: pkg.created_at,
      updatedAt: pkg.updated_at,
      visibility: pkg.visibility,
    };
  }

  /**
   * Format search result
   */
  private formatSearchResult(pkg: any): any {
    return {
      name: `linuxserver/${pkg.name}`,
      description: pkg.description || '',
      url: pkg.html_url,
      visibility: pkg.visibility,
    };
  }
}
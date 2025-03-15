import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'CustomRegistryComponent' }, { msgPrefix: '[CUSTOM_REGISTRY] - ' });

/**
 * Custom registry implementation for private Docker registries
 */
@Injectable()
export class CustomRegistryComponent extends AbstractRegistryComponent {
  private baseUrl: string | null = null;
  private token: string | null = null;
  
  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up custom registry: ${this.name}`);
    
    if (!this.configuration.url) {
      throw new Error('Registry URL is required');
    }
    
    // Set base URL
    this.baseUrl = this.configuration.url.replace(/\/$/, '');
    
    // Check if we need to authenticate
    if (this.configuration.username && this.configuration.password) {
      try {
        await this.authenticate();
        logger.info(`Successfully authenticated with custom registry at ${this.baseUrl}`);
      } catch (error) {
        logger.error(`Failed to authenticate with registry at ${this.baseUrl}: ${error.message}`);
        // Don't throw - we'll try to use anonymous access
      }
    } else {
      logger.info(`Using anonymous access to registry at ${this.baseUrl}`);
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up custom registry: ${this.name}`);
    this.token = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating custom registry configuration: ${this.name}`);
    
    // Update base URL
    if (this.configuration.url) {
      this.baseUrl = this.configuration.url.replace(/\/$/, '');
    }
    
    // Reset authentication
    this.token = null;
    
    // Re-authenticate if credentials are provided
    if (this.configuration.username && this.configuration.password) {
      try {
        await this.authenticate();
        logger.info(`Successfully re-authenticated with registry at ${this.baseUrl}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with registry at ${this.baseUrl}: ${error.message}`);
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      if (!this.baseUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Get catalog
      const response = await axios.get(
        `${this.baseUrl}/v2/_catalog`,
        this.getAuthHeaders()
      );
      
      // Get details for each repository
      const repositories = response.data.repositories || [];
      const images = [];
      
      for (const repo of repositories) {
        try {
          const tagResponse = await axios.get(
            `${this.baseUrl}/v2/${repo}/tags/list`,
            this.getAuthHeaders()
          );
          
          const tags = tagResponse.data.tags || [];
          images.push({
            name: repo,
            tags,
          });
        } catch (error) {
          logger.error(`Failed to get tags for repository ${repo}: ${error.message}`);
        }
      }
      
      return images;
    } catch (error) {
      logger.error(`Failed to list images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   * Note: Custom registries typically don't support search, so we filter from the catalog
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      const allImages = await this.listImages();
      
      // Filter images by query
      return allImages.filter(image => 
        image.name.toLowerCase().includes(query.toLowerCase())
      );
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
      if (!this.baseUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Get manifest
      const manifestResponse = await axios.get(
        `${this.baseUrl}/v2/${imageName}/manifests/${tag}`,
        {
          ...this.getAuthHeaders(),
          headers: {
            ...this.getAuthHeaders().headers,
            Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          },
        }
      );
      
      // Get config blob
      const configDigest = manifestResponse.data.config?.digest;
      let config = null;
      
      if (configDigest) {
        const configResponse = await axios.get(
          `${this.baseUrl}/v2/${imageName}/blobs/${configDigest}`,
          this.getAuthHeaders()
        );
        config = configResponse.data;
      }
      
      return {
        name: imageName,
        tag,
        digest: manifestResponse.data.config?.digest,
        created: config?.created,
        architecture: config?.architecture,
        os: config?.os,
        layers: manifestResponse.data.layers?.length || 0,
        size: manifestResponse.data.layers?.reduce((sum, layer) => sum + layer.size, 0) || 0,
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
      if (!this.baseUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Try to access the API
      await axios.get(
        `${this.baseUrl}/v2/`,
        this.getAuthHeaders()
      );
      
      return true;
    } catch (error) {
      logger.error(`Connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Authenticate with the registry
   */
  private async authenticate(): Promise<void> {
    try {
      if (!this.baseUrl) {
        throw new Error('Registry URL not set');
      }
      
      const { username, password } = this.configuration;
      
      if (!username || !password) {
        throw new Error('Username and password are required for authentication');
      }
      
      // Get auth challenge
      const response = await axios.get(`${this.baseUrl}/v2/`, {
        validateStatus: status => status === 401, // We expect a 401 response with auth info
      });
      
      const authHeader = response.headers['www-authenticate'];
      if (!authHeader) {
        throw new Error('Registry did not provide authentication challenge');
      }
      
      // Parse auth challenge
      const matches = authHeader.match(/Bearer realm="([^"]+)",service="([^"]+)"(?:,scope="([^"]+)")?/);
      if (!matches) {
        throw new Error('Could not parse authentication challenge');
      }
      
      const [, realm, service, scope] = matches;
      
      // Get auth token
      const tokenResponse = await axios.get(realm, {
        params: {
          service,
          scope,
          account: username,
        },
        auth: {
          username,
          password,
        },
      });
      
      this.token = tokenResponse.data.token || tokenResponse.data.access_token;
      
      if (!this.token) {
        throw new Error('Registry did not provide authentication token');
      }
    } catch (error) {
      logger.error(`Authentication failed: ${error.message}`);
      throw error;
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
}
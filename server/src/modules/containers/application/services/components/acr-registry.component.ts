import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'AcrRegistryComponent' }, { msgPrefix: '[ACR_REGISTRY] - ' });

/**
 * Azure Container Registry implementation
 */
@Injectable()
export class AcrRegistryComponent extends AbstractRegistryComponent {
  private registryUrl: string | null = null;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up Azure Container Registry: ${this.name}`);
    
    // Check if we have credentials
    if (this.configuration.clientid && this.configuration.clientsecret) {
      try {
        // Determine registry URL based on name
        this.registryUrl = `https://${this.name}.azurecr.io`;
        
        // Get authentication token
        await this.authenticate();
        logger.info(`Successfully authenticated with ACR at ${this.registryUrl}`);
      } catch (error) {
        logger.error(`Failed to authenticate with ACR: ${error.message}`);
        // Don't throw - we'll try to use anonymous access (which likely won't work for ACR)
        this.token = null;
      }
    } else {
      logger.warn('ACR requires client ID and client secret for authentication');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up ACR registry: ${this.name}`);
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating ACR registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    this.tokenExpiry = null;
    
    // Update registry URL if name changed
    this.registryUrl = `https://${this.name}.azurecr.io`;
    
    // Re-authenticate if credentials are provided
    if (this.configuration.clientid && this.configuration.clientsecret) {
      try {
        await this.authenticate();
        logger.info(`Successfully re-authenticated with ACR at ${this.registryUrl}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with ACR: ${error.message}`);
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      if (!this.registryUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Ensure we're authenticated
      await this.ensureAuthenticated();
      
      // Get catalog
      const response = await axios.get(
        `${this.registryUrl}/v2/_catalog`,
        this.getAuthHeaders()
      );
      
      // Get details for each repository
      const repositories = response.data.repositories || [];
      const images = [];
      
      for (const repo of repositories) {
        try {
          const tagsResponse = await axios.get(
            `${this.registryUrl}/v2/${repo}/tags/list`,
            this.getAuthHeaders()
          );
          
          const tags = tagsResponse.data.tags || [];
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
      logger.error(`Failed to list ACR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   * Note: ACR doesn't have a search API, so we filter from the catalog
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      const allImages = await this.listImages();
      
      // Filter images by query
      return allImages.filter(image => 
        image.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error(`Failed to search ACR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      if (!this.registryUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Ensure we're authenticated
      await this.ensureAuthenticated();
      
      // Get manifest
      const manifestResponse = await axios.get(
        `${this.registryUrl}/v2/${imageName}/manifests/${tag}`,
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
          `${this.registryUrl}/v2/${imageName}/blobs/${configDigest}`,
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
        size: manifestResponse.data.layers?.reduce((sum, layer) => sum + (layer.size || 0), 0) || 0,
      };
    } catch (error) {
      logger.error(`Failed to get ACR image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.registryUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Try to authenticate
      await this.authenticate();
      
      // Try to access a basic API endpoint
      await axios.get(
        `${this.registryUrl}/v2/`,
        this.getAuthHeaders()
      );
      
      return true;
    } catch (error) {
      logger.error(`ACR connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Authenticate with Azure Container Registry
   * ACR uses Azure Active Directory OAuth 2.0
   */
  private async authenticate(): Promise<void> {
    try {
      const { clientid, clientsecret } = this.configuration;
      
      if (!clientid || !clientsecret) {
        throw new Error('Client ID and client secret are required for ACR authentication');
      }
      
      if (!this.registryUrl) {
        throw new Error('Registry URL not set');
      }
      
      // Get AAD token
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/common/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientid,
          client_secret: clientsecret,
          resource: 'https://management.azure.com/',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      this.token = tokenResponse.data.access_token;
      
      // Set token expiry
      const expiresIn = tokenResponse.data.expires_in; // in seconds
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn - 300); // 5 minutes buffer
      this.tokenExpiry = expiryTime;
      
      logger.info('Successfully obtained ACR authentication token');
    } catch (error) {
      logger.error(`ACR authentication failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensure we're authenticated
   */
  private async ensureAuthenticated(): Promise<void> {
    // Check if token is missing or expired
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
}
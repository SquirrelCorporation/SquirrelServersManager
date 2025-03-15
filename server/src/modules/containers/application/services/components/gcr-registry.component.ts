import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

const logger = PinoLogger.child({ module: 'GcrRegistryComponent' }, { msgPrefix: '[GCR_REGISTRY] - ' });

/**
 * Google Container Registry implementation
 */
@Injectable()
export class GcrRegistryComponent extends AbstractRegistryComponent {
  private baseUrl = 'https://gcr.io';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private auth: GoogleAuth | null = null;
  private client: any = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up GCR registry: ${this.name}`);
    
    // Check if we have credentials
    if (this.configuration.clientemail && this.configuration.privatekey) {
      try {
        await this.authenticate();
        logger.info(`Successfully authenticated with GCR as ${this.configuration.clientemail}`);
      } catch (error) {
        logger.error(`Failed to authenticate with GCR: ${error.message}`);
        // Don't throw - we'll try to use anonymous access
      }
    } else {
      logger.info('Using anonymous access to GCR (limited to public images)');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up GCR registry: ${this.name}`);
    this.token = null;
    this.tokenExpiry = null;
    this.auth = null;
    this.client = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating GCR registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    this.tokenExpiry = null;
    this.auth = null;
    this.client = null;
    
    // Re-authenticate if credentials are provided
    if (this.configuration.clientemail && this.configuration.privatekey) {
      try {
        await this.authenticate();
        logger.info(`Successfully re-authenticated with GCR as ${this.configuration.clientemail}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with GCR: ${error.message}`);
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      // Ensure we're authenticated if credentials are provided
      if (this.configuration.clientemail && this.configuration.privatekey) {
        await this.ensureAuthenticated();
      }
      
      // Get catalog from GCR API
      // GCR doesn't provide a direct catalog endpoint like Docker Registry API
      // Instead, we use the GCR-specific API
      const response = await axios.get(
        `${this.baseUrl}/v2/_catalog`,
        this.getAuthHeaders()
      );
      
      // Transform the response to match our expected format
      const repositories = response.data.repositories || [];
      const result = [];
      
      // Get tags for each repository
      for (const repo of repositories) {
        try {
          const tagsResponse = await axios.get(
            `${this.baseUrl}/v2/${repo}/tags/list`,
            this.getAuthHeaders()
          );
          
          result.push({
            name: repo,
            tags: tagsResponse.data.tags || [],
          });
        } catch (error) {
          logger.error(`Failed to get tags for ${repo}: ${error.message}`);
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to list GCR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   * Note: GCR doesn't have a direct search API, so we filter from the catalog
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      const allImages = await this.listImages();
      
      // Filter images by query
      return allImages.filter(image => 
        image.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error(`Failed to search GCR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      // Ensure we're authenticated if credentials are provided
      if (this.configuration.clientemail && this.configuration.privatekey) {
        await this.ensureAuthenticated();
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
      
      // Get config blob if available
      const configDigest = manifestResponse.data.config?.digest;
      let config = null;
      
      if (configDigest) {
        const configResponse = await axios.get(
          `${this.baseUrl}/v2/${imageName}/blobs/${configDigest}`,
          this.getAuthHeaders()
        );
        config = configResponse.data;
      }
      
      // Return formatted image info
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
      logger.error(`Failed to get GCR image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.configuration.clientemail && this.configuration.privatekey) {
        // Try to authenticate
        await this.authenticate();
        return true;
      }
      
      // For anonymous access, try a basic API call
      await axios.get(`${this.baseUrl}/v2/`);
      return true;
    } catch (error) {
      logger.error(`GCR connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Authenticate with GCR
   */
  private async authenticate(): Promise<void> {
    try {
      const { clientemail, privatekey } = this.configuration;
      
      if (!clientemail || !privatekey) {
        throw new Error('Client email and private key are required for GCR authentication');
      }
      
      // Create a new GoogleAuth instance
      this.auth = new GoogleAuth({
        credentials: {
          client_email: clientemail,
          private_key: privatekey,
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      
      // Get the client
      this.client = await this.auth.getClient();
      
      // Get an access token
      const { token, expiryDate } = await this.client.getAccessToken();
      this.token = token;
      this.tokenExpiry = expiryDate;
      
      logger.info('Successfully authenticated with GCR');
    } catch (error) {
      logger.error(`GCR authentication failed: ${error.message}`);
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
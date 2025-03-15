import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';
import { ECR } from '@aws-sdk/client-ecr';

const logger = PinoLogger.child({ module: 'EcrRegistryComponent' }, { msgPrefix: '[ECR_REGISTRY] - ' });
const ECR_PUBLIC_GALLERY_HOSTNAME = 'public.ecr.aws';

/**
 * AWS Elastic Container Registry implementation
 */
@Injectable()
export class EcrRegistryComponent extends AbstractRegistryComponent {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private ecrClient: ECR | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up ECR registry: ${this.name}`);
    
    // For authenticated access to private ECR
    if (this.configuration.accesskeyid && this.configuration.secretaccesskey && this.configuration.region) {
      try {
        // Initialize ECR client
        this.ecrClient = new ECR({
          credentials: {
            accessKeyId: this.configuration.accesskeyid,
            secretAccessKey: this.configuration.secretaccesskey,
          },
          region: this.configuration.region,
        });
        
        // Test authentication
        await this.authenticate();
        logger.info(`Successfully authenticated with ECR in region ${this.configuration.region}`);
      } catch (error) {
        logger.error(`Failed to authenticate with ECR: ${error.message}`);
        this.ecrClient = null;
      }
    } else {
      logger.info('Using anonymous access to ECR (limited to public repositories)');
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up ECR registry: ${this.name}`);
    this.token = null;
    this.tokenExpiry = null;
    this.ecrClient = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating ECR registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    this.tokenExpiry = null;
    this.ecrClient = null;
    
    // Re-initialize ECR client if credentials are provided
    if (this.configuration.accesskeyid && this.configuration.secretaccesskey && this.configuration.region) {
      try {
        this.ecrClient = new ECR({
          credentials: {
            accessKeyId: this.configuration.accesskeyid,
            secretAccessKey: this.configuration.secretaccesskey,
          },
          region: this.configuration.region,
        });
        
        // Test authentication
        await this.authenticate();
        logger.info(`Successfully re-authenticated with ECR in region ${this.configuration.region}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with ECR: ${error.message}`);
        this.ecrClient = null;
      }
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      if (!this.ecrClient) {
        if (this.configuration.accesskeyid && this.configuration.secretaccesskey) {
          throw new Error('ECR client not initialized');
        }
        
        // For public ECR repositories
        logger.info('Listing public ECR Gallery images');
        const response = await axios.get(
          'https://api.gallery.ecr.aws/v1/repositories',
          this.getPublicEcrAuthHeaders()
        );
        
        return response.data.repositories.map(repo => ({
          name: repo.repositoryName,
          namespace: repo.namespace,
          description: repo.description,
          verified: repo.verified,
          created: repo.created,
        }));
      }
      
      // For private ECR repositories
      logger.info(`Listing ECR repositories in region ${this.configuration.region}`);
      await this.ensureAuthenticated();
      
      const repositories = await this.ecrClient.describeRepositories({});
      const result = [];
      
      for (const repo of repositories.repositories || []) {
        try {
          const imagesResponse = await this.ecrClient.listImages({
            repositoryName: repo.repositoryName,
          });
          
          const tags = imagesResponse.imageIds?.map(id => id.imageTag).filter(Boolean) || [];
          
          result.push({
            name: repo.repositoryName,
            uri: repo.repositoryUri,
            tags,
            created: repo.createdAt,
          });
        } catch (error) {
          logger.error(`Failed to list images for repository ${repo.repositoryName}: ${error.message}`);
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to list ECR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      // For public ECR repositories
      if (!this.ecrClient) {
        logger.info(`Searching public ECR Gallery for: ${query}`);
        
        const response = await axios.get(
          `https://api.gallery.ecr.aws/v1/search?q=${encodeURIComponent(query)}`,
          this.getPublicEcrAuthHeaders()
        );
        
        return response.data.repositories.map(repo => ({
          name: repo.repositoryName,
          namespace: repo.namespace,
          description: repo.description,
          verified: repo.verified,
          created: repo.created,
        }));
      }
      
      // For private ECR repositories - get list and filter
      logger.info(`Searching ECR repositories for: ${query}`);
      const allImages = await this.listImages();
      
      return allImages.filter(image => 
        image.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error(`Failed to search ECR images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      // Ensure authenticated for private repositories
      if (this.ecrClient) {
        await this.ensureAuthenticated();
        
        const imageDetails = await this.ecrClient.describeImages({
          repositoryName: imageName,
          imageIds: [{ imageTag: tag }],
        });
        
        if (!imageDetails.imageDetails || imageDetails.imageDetails.length === 0) {
          throw new Error(`Image ${imageName}:${tag} not found`);
        }
        
        const imageDetail = imageDetails.imageDetails[0];
        
        return {
          name: imageName,
          tag,
          digest: imageDetail.imageDigest,
          pushedAt: imageDetail.imagePushedAt,
          size: imageDetail.imageSizeInBytes,
          mediaType: imageDetail.imageManifestMediaType,
          tags: imageDetail.imageTags,
        };
      }
      
      // For public ECR repositories
      logger.info(`Getting public ECR image info for: ${imageName}:${tag}`);
      
      // Parse image name
      let namespace = '';
      let repository = imageName;
      
      if (imageName.includes('/')) {
        const parts = imageName.split('/');
        namespace = parts[0];
        repository = parts[1];
      }
      
      const response = await axios.get(
        `https://api.gallery.ecr.aws/v1/repositories/${namespace}/${repository}`,
        this.getPublicEcrAuthHeaders()
      );
      
      // Get tag information
      const tagResponse = await axios.get(
        `https://api.gallery.ecr.aws/v1/repositories/${namespace}/${repository}/tags/${tag}`,
        this.getPublicEcrAuthHeaders()
      );
      
      return {
        name: imageName,
        tag,
        namespace: response.data.namespace,
        description: response.data.description,
        verified: response.data.verified,
        created: response.data.created,
        tagDetails: {
          digest: tagResponse.data.digest,
          size: tagResponse.data.size,
          updatedAt: tagResponse.data.updatedAt,
        },
      };
    } catch (error) {
      logger.error(`Failed to get ECR image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.configuration.accesskeyid && this.configuration.secretaccesskey) {
        // Try to authenticate with ECR
        await this.authenticate();
        return true;
      }
      
      // For public ECR gallery, try to access the API
      await axios.get(
        'https://api.gallery.ecr.aws/v1/repositories',
        this.getPublicEcrAuthHeaders()
      );
      
      return true;
    } catch (error) {
      logger.error(`ECR connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Authenticate with ECR
   */
  private async authenticate(): Promise<void> {
    try {
      if (!this.ecrClient) {
        throw new Error('ECR client not initialized');
      }
      
      // Get authorization token from ECR
      const authResponse = await this.ecrClient.getAuthorizationToken({});
      
      if (!authResponse.authorizationData || authResponse.authorizationData.length === 0) {
        throw new Error('No authorization data received from ECR');
      }
      
      const authData = authResponse.authorizationData[0];
      this.token = authData.authorizationToken || null;
      
      // Set token expiry (ECR tokens are typically valid for 12 hours)
      if (authData.expiresAt) {
        this.tokenExpiry = authData.expiresAt;
      } else {
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 12);
        this.tokenExpiry = expiryTime;
      }
      
      logger.info('Successfully obtained ECR authentication token');
    } catch (error) {
      logger.error(`ECR authentication failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Ensure we're authenticated with ECR
   */
  private async ensureAuthenticated(): Promise<void> {
    // Check if token is missing or expired
    if (!this.token || (this.tokenExpiry && new Date() > this.tokenExpiry)) {
      await this.authenticate();
    }
  }

  /**
   * Get headers with authentication token for private repositories
   */
  private getAuthHeaders(): any {
    if (this.token) {
      return {
        headers: {
          Authorization: `Basic ${this.token}`,
        },
      };
    }
    
    return {};
  }

  /**
   * Get headers for public ECR gallery
   */
  private async getPublicEcrAuthHeaders(): Promise<any> {
    try {
      // Get public ECR gallery token
      const response = await axios.get('https://public.ecr.aws/token/', {
        headers: {
          Accept: 'application/json',
        },
      });
      
      return {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
        },
      };
    } catch (error) {
      logger.error(`Failed to get public ECR token: ${error.message}`);
      return {};
    }
  }
}
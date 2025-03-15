import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'GiteaRegistryComponent' }, { msgPrefix: '[GITEA_REGISTRY] - ' });

/**
 * Gitea Container Registry implementation
 */
@Injectable()
export class GiteaRegistryComponent extends AbstractRegistryComponent {
  private baseUrl: string | null = null;
  private apiUrl: string | null = null;
  private token: string | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up Gitea Container Registry: ${this.name}`);
    
    if (!this.configuration.url) {
      throw new Error('Gitea URL is required');
    }
    
    // Ensure URL has http/https prefix
    let url = this.configuration.url;
    if (!url.toLowerCase().startsWith('http')) {
      url = `https://${url}`;
    }
    
    // Set base URLs (remove trailing slashes)
    this.baseUrl = url.replace(/\/$/, '');
    this.apiUrl = `${this.baseUrl}/api/v1`;
    
    try {
      // Test connection
      await this.testConnection();
      logger.info(`Successfully connected to Gitea at ${this.baseUrl}`);
    } catch (error) {
      logger.error(`Failed to connect to Gitea: ${error.message}`);
      // Don't throw, we'll try again when needed
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up Gitea Container Registry: ${this.name}`);
    this.token = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating Gitea Container Registry configuration: ${this.name}`);
    
    // Reset state
    this.token = null;
    
    if (!this.configuration.url) {
      throw new Error('Gitea URL is required');
    }
    
    // Update URLs
    let url = this.configuration.url;
    if (!url.toLowerCase().startsWith('http')) {
      url = `https://${url}`;
    }
    
    this.baseUrl = url.replace(/\/$/, '');
    this.apiUrl = `${this.baseUrl}/api/v1`;
    
    try {
      // Test with new configuration
      await this.testConnection();
      logger.info(`Successfully reconnected to Gitea at ${this.baseUrl}`);
    } catch (error) {
      logger.error(`Failed to reconnect to Gitea: ${error.message}`);
    }
  }

  /**
   * List all images in the registry
   */
  async listImages(): Promise<any[]> {
    try {
      if (!this.baseUrl || !this.apiUrl) {
        throw new Error('Gitea URLs not set');
      }
      
      // Get user repositories from Gitea API
      const response = await axios.get(
        `${this.apiUrl}/user/repos`,
        this.getAuthHeaders()
      );
      
      const repositories = response.data;
      const result = [];
      
      // Check which repositories have container registry packages
      for (const repo of repositories) {
        try {
          // Gitea API path for packages
          const packagesResponse = await axios.get(
            `${this.apiUrl}/packages/${repo.owner.username}?type=container`,
            this.getAuthHeaders()
          );
          
          // Filter packages for this repository
          const packages = packagesResponse.data.filter(pkg => 
            pkg.repository && pkg.repository.id === repo.id
          );
          
          for (const pkg of packages) {
            // Get package versions (tags)
            const versionsResponse = await axios.get(
              `${this.apiUrl}/packages/${repo.owner.username}/${pkg.name}/versions`,
              this.getAuthHeaders()
            );
            
            result.push({
              name: pkg.name,
              repository: repo.name,
              owner: repo.owner.username,
              description: repo.description,
              tags: versionsResponse.data.map(ver => ver.name),
              created: pkg.created_at,
              updated: pkg.updated_at,
            });
          }
        } catch (error) {
          // Not all repositories have container registry packages, so ignore 404s
          if (error.response && error.response.status !== 404) {
            logger.error(`Failed to get packages for repository ${repo.name}: ${error.message}`);
          }
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to list Gitea images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      if (!this.baseUrl || !this.apiUrl) {
        throw new Error('Gitea URLs not set');
      }
      
      // Use Gitea API to search for packages
      const response = await axios.get(
        `${this.apiUrl}/packages/search?q=${encodeURIComponent(query)}&type=container`,
        this.getAuthHeaders()
      );
      
      return response.data.map(pkg => ({
        name: pkg.name,
        owner: pkg.owner.username,
        description: pkg.description || '',
        created: pkg.created_at,
        updated: pkg.updated_at,
      }));
    } catch (error) {
      logger.error(`Failed to search Gitea images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      if (!this.baseUrl || !this.apiUrl) {
        throw new Error('Gitea URLs not set');
      }
      
      // Parse image name to get owner and package name
      let owner = '';
      let packageName = imageName;
      
      if (imageName.includes('/')) {
        const parts = imageName.split('/');
        owner = parts[0];
        packageName = parts[parts.length - 1];
      } else {
        // For repositories without owner in the name, use current user
        const userResponse = await axios.get(
          `${this.apiUrl}/user`,
          this.getAuthHeaders()
        );
        owner = userResponse.data.username;
      }
      
      // Get package details
      const packageResponse = await axios.get(
        `${this.apiUrl}/packages/${owner}/${packageName}?type=container`,
        this.getAuthHeaders()
      );
      
      // Get version details
      let versionId = '';
      const versionsResponse = await axios.get(
        `${this.apiUrl}/packages/${owner}/${packageName}/versions`,
        this.getAuthHeaders()
      );
      
      const version = versionsResponse.data.find(v => v.name === tag);
      if (version) {
        versionId = version.id;
      } else {
        throw new Error(`Tag '${tag}' not found for image '${imageName}'`);
      }
      
      // Get registry tag details using Docker Registry API
      await this.ensureAuthenticated();
      
      const manifestResponse = await axios.get(
        `${this.baseUrl}/v2/${owner}/${packageName}/manifests/${tag}`,
        {
          ...this.getAuthHeaders(),
          headers: {
            ...this.getAuthHeaders().headers,
            Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          },
        }
      );
      
      return {
        name: `${owner}/${packageName}`,
        tag,
        description: packageResponse.data.description || '',
        created: version.created_at,
        files: version.files.length,
        size: version.files.reduce((sum, file) => sum + file.size, 0),
        manifest: {
          schemaVersion: manifestResponse.data.schemaVersion,
          mediaType: manifestResponse.data.mediaType,
          layers: manifestResponse.data.layers?.length || 0,
        },
      };
    } catch (error) {
      logger.error(`Failed to get Gitea image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.baseUrl || !this.apiUrl) {
        throw new Error('Gitea URLs not set');
      }
      
      // For authenticated access
      if (this.configuration.login && this.configuration.password) {
        const response = await axios.get(
          `${this.apiUrl}/user`,
          {
            auth: {
              username: this.configuration.login,
              password: this.configuration.password,
            },
          }
        );
        
        return response.data && response.data.id !== undefined;
      }
      
      // For auth token access
      if (this.configuration.auth) {
        const response = await axios.get(
          `${this.apiUrl}/user`,
          {
            headers: {
              Authorization: `Basic ${this.configuration.auth}`,
            },
          }
        );
        
        return response.data && response.data.id !== undefined;
      }
      
      // For anonymous access, check version
      const response = await axios.get(`${this.apiUrl}/version`);
      return response.data && response.data.version !== undefined;
    } catch (error) {
      logger.error(`Gitea connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Ensure we're authenticated
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.token) {
      // Get registry token if using Docker Registry API
      await this.getRegistryToken();
    }
  }

  /**
   * Get Docker Registry API token
   */
  private async getRegistryToken(): Promise<void> {
    try {
      if (!this.baseUrl) {
        throw new Error('Gitea URL not set');
      }
      
      // We need to use the Docker Registry auth challenge
      const response = await axios.get(`${this.baseUrl}/v2/`, {
        validateStatus: status => status === 401, // We expect a 401 response with auth info
      });
      
      const authHeader = response.headers['www-authenticate'];
      if (!authHeader) {
        throw new Error('Gitea registry did not provide authentication challenge');
      }
      
      // Parse auth challenge
      const matches = authHeader.match(/Bearer realm="([^"]+)",service="([^"]+)"(?:,scope="([^"]+)")?/);
      if (!matches) {
        throw new Error('Could not parse authentication challenge');
      }
      
      const [, realm, service, scope] = matches;
      
      // Get auth token
      let tokenResponse;
      
      if (this.configuration.login && this.configuration.password) {
        tokenResponse = await axios.get(realm, {
          params: {
            service,
            scope,
          },
          auth: {
            username: this.configuration.login,
            password: this.configuration.password,
          },
        });
      } else if (this.configuration.auth) {
        tokenResponse = await axios.get(realm, {
          params: {
            service,
            scope,
          },
          headers: {
            Authorization: `Basic ${this.configuration.auth}`,
          },
        });
      } else {
        // Anonymous access
        tokenResponse = await axios.get(realm, {
          params: {
            service,
            scope,
          },
        });
      }
      
      this.token = tokenResponse.data.token || tokenResponse.data.access_token;
      
      if (!this.token) {
        throw new Error('Gitea registry did not provide authentication token');
      }
      
      logger.info('Successfully obtained Gitea registry token');
    } catch (error) {
      logger.error(`Failed to get Gitea registry token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): any {
    // For Registry API with token
    if (this.token) {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };
    }
    
    // For Gitea API with username/password
    if (this.configuration.login && this.configuration.password) {
      return {
        auth: {
          username: this.configuration.login,
          password: this.configuration.password,
        },
      };
    }
    
    // For Gitea API with auth token
    if (this.configuration.auth) {
      return {
        headers: {
          Authorization: `Basic ${this.configuration.auth}`,
        },
      };
    }
    
    // For anonymous access
    return {};
  }
}
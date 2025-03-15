import { Injectable } from '@nestjs/common';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import axios from 'axios';

const logger = PinoLogger.child({ module: 'GitLabRegistryComponent' }, { msgPrefix: '[GITLAB_REGISTRY] - ' });

/**
 * GitLab Container Registry implementation
 */
@Injectable()
export class GitLabRegistryComponent extends AbstractRegistryComponent {
  private registryUrl: string | null = null;
  private authUrl: string | null = null;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up GitLab Container Registry: ${this.name}`);
    
    if (!this.configuration.token) {
      throw new Error('GitLab personal access token is required');
    }
    
    // Set default URLs if not provided
    this.registryUrl = this.configuration.url || 'https://registry.gitlab.com';
    this.authUrl = this.configuration.authurl || 'https://gitlab.com';
    
    // Ensure URLs have no trailing slashes
    this.registryUrl = this.registryUrl.replace(/\/$/, '');
    this.authUrl = this.authUrl.replace(/\/$/, '');
    
    try {
      // Test connection
      await this.testConnection();
      logger.info(`Successfully authenticated with GitLab Container Registry at ${this.registryUrl}`);
    } catch (error) {
      logger.error(`Failed to authenticate with GitLab Container Registry: ${error.message}`);
      // Keep going, we'll try to authenticate when needed
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up GitLab Container Registry: ${this.name}`);
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating GitLab Container Registry configuration: ${this.name}`);
    
    // Reset authentication
    this.token = null;
    this.tokenExpiry = null;
    
    // Update URLs
    this.registryUrl = this.configuration.url || 'https://registry.gitlab.com';
    this.authUrl = this.configuration.authurl || 'https://gitlab.com';
    
    // Ensure URLs have no trailing slashes
    this.registryUrl = this.registryUrl.replace(/\/$/, '');
    this.authUrl = this.authUrl.replace(/\/$/, '');
    
    if (this.configuration.token) {
      try {
        // Test connection with new configuration
        await this.testConnection();
        logger.info(`Successfully re-authenticated with GitLab Container Registry at ${this.registryUrl}`);
      } catch (error) {
        logger.error(`Failed to re-authenticate with GitLab Container Registry: ${error.message}`);
      }
    } else {
      logger.warn('GitLab personal access token is missing');
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
      
      if (!this.configuration.token) {
        throw new Error('GitLab token is required');
      }
      
      // Get projects with container registries
      // We use GitLab API rather than registry API since it provides more information
      const response = await axios.get(
        `${this.authUrl}/api/v4/projects?membership=true&simple=true`,
        {
          headers: {
            'Private-Token': this.configuration.token,
          },
        }
      );
      
      const projects = response.data;
      const result = [];
      
      // For each project, get registry repositories
      for (const project of projects) {
        try {
          const repoResponse = await axios.get(
            `${this.authUrl}/api/v4/projects/${project.id}/registry/repositories`,
            {
              headers: {
                'Private-Token': this.configuration.token,
              },
            }
          );
          
          // For each repository, get tags
          for (const repo of repoResponse.data) {
            try {
              const tagsResponse = await axios.get(
                `${this.authUrl}/api/v4/projects/${project.id}/registry/repositories/${repo.id}/tags`,
                {
                  headers: {
                    'Private-Token': this.configuration.token,
                  },
                }
              );
              
              result.push({
                id: repo.id,
                name: repo.path,
                projectId: project.id,
                projectName: project.name,
                projectPath: project.path_with_namespace,
                location: repo.location,
                tags: tagsResponse.data.map(tag => tag.name),
                createdAt: repo.created_at,
              });
            } catch (error) {
              logger.error(`Failed to get tags for repository ${repo.path}: ${error.message}`);
            }
          }
        } catch (error) {
          logger.error(`Failed to get repositories for project ${project.name}: ${error.message}`);
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to list GitLab images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for images in the registry
   */
  async searchImages(query: string): Promise<any[]> {
    try {
      if (!this.registryUrl) {
        throw new Error('Registry URL not set');
      }
      
      if (!this.configuration.token) {
        throw new Error('GitLab token is required');
      }
      
      // Use GitLab API to search for projects first
      const projectsResponse = await axios.get(
        `${this.authUrl}/api/v4/projects?search=${encodeURIComponent(query)}&membership=true&simple=true`,
        {
          headers: {
            'Private-Token': this.configuration.token,
          },
        }
      );
      
      const projects = projectsResponse.data;
      const result = [];
      
      // For each project, get registry repositories
      for (const project of projects) {
        try {
          const repoResponse = await axios.get(
            `${this.authUrl}/api/v4/projects/${project.id}/registry/repositories`,
            {
              headers: {
                'Private-Token': this.configuration.token,
              },
            }
          );
          
          for (const repo of repoResponse.data) {
            result.push({
              id: repo.id,
              name: repo.path,
              projectId: project.id,
              projectName: project.name,
              projectPath: project.path_with_namespace,
              location: repo.location,
              createdAt: repo.created_at,
            });
          }
        } catch (error) {
          logger.error(`Failed to get repositories for project ${project.name}: ${error.message}`);
        }
      }
      
      // Alternatively, we can get all repositories and filter manually
      if (result.length === 0) {
        const allImages = await this.listImages();
        return allImages.filter(image => 
          image.name.toLowerCase().includes(query.toLowerCase()) ||
          image.projectName.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to search GitLab images: ${error.message}`);
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
      
      if (!this.configuration.token) {
        throw new Error('GitLab token is required');
      }
      
      // Parse image name to extract project and image path
      // Format: project/group/image or just image
      let projectPath = '';
      const pathParts = imageName.split('/');
      
      // Get project info
      const projectsResponse = await axios.get(
        `${this.authUrl}/api/v4/projects?search=${encodeURIComponent(pathParts[0])}&membership=true`,
        {
          headers: {
            'Private-Token': this.configuration.token,
          },
        }
      );
      
      if (projectsResponse.data.length === 0) {
        throw new Error(`Project not found for image: ${imageName}`);
      }
      
      // Try to find exact project match
      let projectId = projectsResponse.data[0].id;
      for (const project of projectsResponse.data) {
        if (project.path_with_namespace === imageName.split(':')[0]) {
          projectId = project.id;
          projectPath = project.path_with_namespace;
          break;
        }
      }
      
      // Find repository
      const repoResponse = await axios.get(
        `${this.authUrl}/api/v4/projects/${projectId}/registry/repositories`,
        {
          headers: {
            'Private-Token': this.configuration.token,
          },
        }
      );
      
      if (repoResponse.data.length === 0) {
        throw new Error(`No repositories found in project ${projectPath || projectId}`);
      }
      
      // Find repository matching image name
      let repoId = repoResponse.data[0].id;
      let repoPath = repoResponse.data[0].path;
      
      for (const repo of repoResponse.data) {
        if (repo.path === imageName || repo.path.endsWith(`/${imageName}`)) {
          repoId = repo.id;
          repoPath = repo.path;
          break;
        }
      }
      
      // Get tag info
      const tagResponse = await axios.get(
        `${this.authUrl}/api/v4/projects/${projectId}/registry/repositories/${repoId}/tags/${tag}`,
        {
          headers: {
            'Private-Token': this.configuration.token,
          },
        }
      );
      
      // Get manifest from Registry API
      await this.getAuthToken(repoPath);
      
      const manifestResponse = await axios.get(
        `${this.registryUrl}/v2/${repoPath}/manifests/${tag}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.docker.distribution.manifest.v2+json',
          },
        }
      );
      
      return {
        name: repoPath,
        tag: tagResponse.data.name,
        digest: tagResponse.data.digest,
        createdAt: tagResponse.data.created_at,
        total_size: tagResponse.data.total_size,
        manifest: {
          schemaVersion: manifestResponse.data.schemaVersion,
          mediaType: manifestResponse.data.mediaType,
          layers: manifestResponse.data.layers?.length || 0,
        },
      };
    } catch (error) {
      logger.error(`Failed to get GitLab image info for ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.authUrl) {
        throw new Error('Auth URL not set');
      }
      
      if (!this.configuration.token) {
        throw new Error('GitLab token is required');
      }
      
      // Test GitLab API access
      const response = await axios.get(
        `${this.authUrl}/api/v4/user`,
        {
          headers: {
            'Private-Token': this.configuration.token,
          },
        }
      );
      
      // Check if we get user information
      return response.data && response.data.id !== undefined;
    } catch (error) {
      logger.error(`GitLab connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get authentication token for a specific repository
   */
  private async getAuthToken(repository: string): Promise<void> {
    try {
      if (!this.authUrl || !this.registryUrl) {
        throw new Error('Auth or Registry URL not set');
      }
      
      if (!this.configuration.token) {
        throw new Error('GitLab token is required');
      }
      
      // Create base64 encoded credentials (empty username, token as password)
      const credentials = Buffer.from(`:${this.configuration.token}`, 'utf-8').toString('base64');
      
      // Get registry auth token
      const response = await axios.get(
        `${this.authUrl}/jwt/auth?service=container_registry&scope=repository:${repository}:pull`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${credentials}`,
          },
        }
      );
      
      this.token = response.data.token;
      
      // Set token expiry (typically 5 minutes for GitLab)
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 5);
      this.tokenExpiry = expiryTime;
      
      logger.info(`Successfully obtained GitLab auth token for ${repository}`);
    } catch (error) {
      logger.error(`Failed to get GitLab auth token: ${error.message}`);
      throw error;
    }
  }
}
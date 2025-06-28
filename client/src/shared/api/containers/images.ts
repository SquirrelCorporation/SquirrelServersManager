import { apiClient } from '@shared/lib/api-client';
import { API } from 'ssm-shared-lib';

export interface ContainerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: Date;
  deviceUuid: string;
  digest?: string;
  labels?: Record<string, string>;
  architecture?: string;
  os?: string;
  inUse: boolean;
  containers?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export interface ImageQuery {
  deviceUuid?: string;
  repository?: string;
  tag?: string;
  inUse?: boolean;
  search?: string;
}

export interface ImagePullRequest {
  deviceUuid: string;
  repository: string;
  tag?: string;
  registry?: string;
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * Container Images API functions
 */
export const imagesApi = {
  /**
   * Get container images list
   */
  getImages: async (query: ImageQuery = {}): Promise<ContainerImage[]> => {
    return apiClient.get('/api/containers/images', { params: query });
  },

  /**
   * Pull new image
   */
  pullImage: async (request: ImagePullRequest): Promise<API.SimpleResult> => {
    return apiClient.post('/api/containers/images/pull', request);
  },

  /**
   * Delete image
   */
  deleteImage: async (imageId: string, force = false): Promise<API.SimpleResult> => {
    return apiClient.delete(`/api/containers/images/${imageId}`, {
      params: { force }
    });
  },

  /**
   * Get image details and history
   */
  getImageDetails: async (imageId: string): Promise<ContainerImage & {
    history: Array<{
      id: string;
      created: Date;
      createdBy: string;
      size: number;
    }>;
  }> => {
    return apiClient.get(`/api/containers/images/${imageId}/details`);
  },

  /**
   * Search images in registries
   */
  searchImages: async (term: string, registry?: string): Promise<Array<{
    name: string;
    description: string;
    stars: number;
    official: boolean;
    automated: boolean;
  }>> => {
    return apiClient.get('/api/containers/images/search', {
      params: { term, registry }
    });
  },

  /**
   * Refresh images list
   */
  refreshImages: async (deviceUuid?: string): Promise<ContainerImage[]> => {
    return apiClient.post('/api/containers/images/refresh', {
      params: { deviceUuid }
    });
  },

  /**
   * Export image
   */
  exportImage: async (imageId: string): Promise<Blob> => {
    return apiClient.get(`/api/containers/images/${imageId}/export`, {
      responseType: 'blob'
    });
  },

  /**
   * Import image from file
   */
  importImage: async (deviceUuid: string, file: File): Promise<API.SimpleResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deviceUuid', deviceUuid);

    return apiClient.post('/api/containers/images/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
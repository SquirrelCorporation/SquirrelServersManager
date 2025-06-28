import { apiClient } from '@shared/lib/api-client';
import { API, SsmContainer } from 'ssm-shared-lib';

export interface Container {
  id: string;
  name: string;
  customName?: string;
  status: SsmContainer.Status;
  image: string;
  state: string;
  type: 'docker' | 'proxmox';
  deviceUuid: string;
  ports?: Array<{
    private: number;
    public: number;
    type: string;
  }>;
  volumes?: Array<{
    source: string;
    destination: string;
    mode: string;
  }>;
  environment?: Record<string, string>;
  labels?: Record<string, string>;
  stats?: {
    cpu: number;
    memory: number;
    network: {
      rx: number;
      tx: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContainerQuery {
  deviceUuid?: string;
  status?: SsmContainer.Status;
  type?: 'docker' | 'proxmox';
  search?: string;
}

export interface ContainerAction {
  containerId: string;
  action: SsmContainer.Actions;
  type: 'docker' | 'proxmox';
}

/**
 * Container API functions
 */
export const containersApi = {
  /**
   * Get containers list with optional filtering
   */
  getContainers: async (query: ContainerQuery = {}): Promise<API.ContainersResponse> => {
    return apiClient.get('/api/containers', { params: query });
  },

  /**
   * Refresh all containers data
   */
  refreshAll: async (deviceUuid?: string): Promise<API.ContainersResponse> => {
    return apiClient.post('/api/containers/refresh-all', {
      params: { deviceUuid }
    });
  },

  /**
   * Update container custom name
   */
  updateCustomName: async (containerId: string, customName: string): Promise<API.SimpleResult> => {
    return apiClient.post(`/api/containers/${containerId}/name`, {
      customName
    });
  },

  /**
   * Execute container action (start, stop, restart, etc.)
   */
  executeAction: async ({ containerId, action, type }: ContainerAction): Promise<API.Response<any>> => {
    const endpoint = type === 'docker' 
      ? `/api/containers/${containerId}/docker/actions/${action}`
      : `/api/containers/${containerId}/proxmox/actions/${action}`;
    
    return apiClient.post(endpoint);
  },

  /**
   * Get container details by ID
   */
  getContainer: async (containerId: string): Promise<Container> => {
    return apiClient.get(`/api/containers/${containerId}`);
  },

  /**
   * Delete container
   */
  deleteContainer: async (containerId: string, force = false): Promise<API.SimpleResult> => {
    return apiClient.delete(`/api/containers/${containerId}`, {
      params: { force }
    });
  },

  /**
   * Get container logs
   */
  getLogs: async (containerId: string, options: {
    tail?: number;
    since?: Date;
    follow?: boolean;
  } = {}): Promise<string[]> => {
    return apiClient.get(`/api/containers/${containerId}/logs`, {
      params: options
    });
  },
};
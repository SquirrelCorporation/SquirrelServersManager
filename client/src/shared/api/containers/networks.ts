import { apiClient } from '@shared/lib/api-client';
import { API } from 'ssm-shared-lib';

export interface ContainerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  deviceUuid: string;
  created: Date;
  subnet?: string;
  gateway?: string;
  ipRange?: string;
  labels?: Record<string, string>;
  options?: Record<string, string>;
  containers?: Array<{
    id: string;
    name: string;
    ipAddress: string;
    macAddress?: string;
  }>;
}

export interface NetworkQuery {
  deviceUuid?: string;
  driver?: string;
  scope?: string;
  search?: string;
}

export interface NetworkCreateRequest {
  deviceUuid: string;
  name: string;
  driver: string;
  internal?: boolean;
  attachable?: boolean;
  enableIPv6?: boolean;
  subnet?: string;
  gateway?: string;
  ipRange?: string;
  labels?: Record<string, string>;
  options?: Record<string, string>;
}

export interface NetworkConnectRequest {
  deviceUuid: string;
  networkId: string;
  containerId: string;
  aliases?: string[];
  ipv4Address?: string;
  ipv6Address?: string;
}

/**
 * Container Networks API functions
 */
export const networksApi = {
  /**
   * Get networks list
   */
  getNetworks: async (query: NetworkQuery = {}): Promise<ContainerNetwork[]> => {
    return apiClient.get('/api/containers/networks', { params: query });
  },

  /**
   * Create new network
   */
  createNetwork: async (request: NetworkCreateRequest): Promise<API.SimpleResult> => {
    return apiClient.post('/api/containers/networks', request);
  },

  /**
   * Delete network
   */
  deleteNetwork: async (networkId: string, deviceUuid: string): Promise<API.SimpleResult> => {
    return apiClient.delete(`/api/containers/networks/${networkId}`, {
      params: { deviceUuid }
    });
  },

  /**
   * Get network details
   */
  getNetworkDetails: async (networkId: string, deviceUuid: string): Promise<ContainerNetwork & {
    ipam: {
      config: Array<{
        subnet: string;
        gateway: string;
        ipRange?: string;
      }>;
    };
    usage: {
      totalContainers: number;
      runningContainers: number;
    };
  }> => {
    return apiClient.get(`/api/containers/networks/${networkId}/details`, {
      params: { deviceUuid }
    });
  },

  /**
   * Connect container to network
   */
  connectContainer: async (request: NetworkConnectRequest): Promise<API.SimpleResult> => {
    return apiClient.post(`/api/containers/networks/${request.networkId}/connect`, {
      containerId: request.containerId,
      aliases: request.aliases,
      ipv4Address: request.ipv4Address,
      ipv6Address: request.ipv6Address,
    }, {
      params: { deviceUuid: request.deviceUuid }
    });
  },

  /**
   * Disconnect container from network
   */
  disconnectContainer: async (networkId: string, containerId: string, deviceUuid: string, force = false): Promise<API.SimpleResult> => {
    return apiClient.post(`/api/containers/networks/${networkId}/disconnect`, {
      containerId,
      force,
    }, {
      params: { deviceUuid }
    });
  },

  /**
   * Refresh networks list
   */
  refreshNetworks: async (deviceUuid?: string): Promise<ContainerNetwork[]> => {
    return apiClient.post('/api/containers/networks/refresh', {
      params: { deviceUuid }
    });
  },

  /**
   * Prune unused networks
   */
  pruneNetworks: async (deviceUuid: string): Promise<{
    networksDeleted: string[];
  }> => {
    return apiClient.post('/api/containers/networks/prune', {
      deviceUuid
    });
  },

  /**
   * Inspect network configuration
   */
  inspectNetwork: async (networkId: string, deviceUuid: string): Promise<{
    id: string;
    name: string;
    driver: string;
    config: any;
    containers: Record<string, any>;
  }> => {
    return apiClient.get(`/api/containers/networks/${networkId}/inspect`, {
      params: { deviceUuid }
    });
  },
};
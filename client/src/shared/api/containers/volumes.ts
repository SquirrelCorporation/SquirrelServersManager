import { apiClient } from '@shared/lib/api-client';
import { API } from 'ssm-shared-lib';

export interface ContainerVolume {
  name: string;
  driver: string;
  mountpoint: string;
  scope: string;
  size?: number;
  deviceUuid: string;
  created: Date;
  labels?: Record<string, string>;
  options?: Record<string, string>;
  inUse: boolean;
  containers?: Array<{
    id: string;
    name: string;
    mountPath: string;
    mode: 'ro' | 'rw';
  }>;
}

export interface VolumeQuery {
  deviceUuid?: string;
  driver?: string;
  inUse?: boolean;
  search?: string;
}

export interface VolumeCreateRequest {
  deviceUuid: string;
  name: string;
  driver?: string;
  labels?: Record<string, string>;
  options?: Record<string, string>;
}

export interface VolumeBackupRequest {
  deviceUuid: string;
  volumeName: string;
  backupName?: string;
  compression?: boolean;
}

export interface VolumeBackup {
  id: string;
  volumeName: string;
  backupName: string;
  deviceUuid: string;
  size: number;
  created: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

/**
 * Container Volumes API functions
 */
export const volumesApi = {
  /**
   * Get volumes list
   */
  getVolumes: async (query: VolumeQuery = {}): Promise<ContainerVolume[]> => {
    return apiClient.get('/api/containers/volumes', { params: query });
  },

  /**
   * Create new volume
   */
  createVolume: async (request: VolumeCreateRequest): Promise<API.SimpleResult> => {
    return apiClient.post('/api/containers/volumes', request);
  },

  /**
   * Delete volume
   */
  deleteVolume: async (volumeName: string, deviceUuid: string, force = false): Promise<API.SimpleResult> => {
    return apiClient.delete(`/api/containers/volumes/${volumeName}`, {
      params: { deviceUuid, force }
    });
  },

  /**
   * Get volume details
   */
  getVolumeDetails: async (volumeName: string, deviceUuid: string): Promise<ContainerVolume & {
    usage: {
      size: number;
      files: number;
      directories: number;
    };
  }> => {
    return apiClient.get(`/api/containers/volumes/${volumeName}/details`, {
      params: { deviceUuid }
    });
  },

  /**
   * Backup volume
   */
  backupVolume: async (request: VolumeBackupRequest): Promise<VolumeBackup> => {
    return apiClient.post('/api/containers/volumes/backup', request);
  },

  /**
   * Get volume backups
   */
  getVolumeBackups: async (deviceUuid?: string, volumeName?: string): Promise<VolumeBackup[]> => {
    return apiClient.get('/api/containers/volumes/backups', {
      params: { deviceUuid, volumeName }
    });
  },

  /**
   * Restore volume from backup
   */
  restoreVolume: async (backupId: string, targetVolumeName?: string): Promise<API.SimpleResult> => {
    return apiClient.post(`/api/containers/volumes/backups/${backupId}/restore`, {
      targetVolumeName
    });
  },

  /**
   * Delete volume backup
   */
  deleteBackup: async (backupId: string): Promise<API.SimpleResult> => {
    return apiClient.delete(`/api/containers/volumes/backups/${backupId}`);
  },

  /**
   * Get backup status
   */
  getBackupStatus: async (backupId: string): Promise<VolumeBackup> => {
    return apiClient.get(`/api/containers/volumes/backups/${backupId}/status`);
  },

  /**
   * Refresh volumes list
   */
  refreshVolumes: async (deviceUuid?: string): Promise<ContainerVolume[]> => {
    return apiClient.post('/api/containers/volumes/refresh', {
      params: { deviceUuid }
    });
  },

  /**
   * Prune unused volumes
   */
  pruneVolumes: async (deviceUuid: string): Promise<{
    volumesDeleted: string[];
    spaceReclaimed: number;
  }> => {
    return apiClient.post('/api/containers/volumes/prune', {
      deviceUuid
    });
  },
};
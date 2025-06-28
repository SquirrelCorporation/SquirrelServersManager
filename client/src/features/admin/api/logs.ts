import { apiClient } from '@shared/lib/api-client';
import type { API } from 'ssm-shared-lib';

/**
 * Admin logs API functions
 */
export const logsApi = {
  /**
   * Get server logs with pagination and filtering
   */
  getServerLogs: async (params: any): Promise<{
    data: API.ServerLog[];
    total: number;
    success: boolean;
  }> => {
    return apiClient.get('/api/logs/server', { params });
  },

  /**
   * Get task logs with pagination and filtering
   */
  getTaskLogs: async (params: any): Promise<{
    data: API.Task[];
    total: number;
    success: boolean;
  }> => {
    return apiClient.get('/api/logs/tasks', { params });
  }
};
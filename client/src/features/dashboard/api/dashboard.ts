import { apiClient } from '@shared/lib/api-client';

export interface DashboardStats {
  devices: {
    total: number;
    online: number;
    offline: number;
    warning: number;
  };
  containers: {
    total: number;
    running: number;
    stopped: number;
    failed: number;
  };
  performance: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgDiskUsage: number;
    totalUptime: number;
  };
  recent: {
    playbookExecutions: number;
    systemAlerts: number;
    lastUpdate: Date;
  };
}

export interface PerformanceMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
}

export interface AvailabilityData {
  deviceId: string;
  deviceName: string;
  uptime: number;
  availability: number; // Percentage
  lastDowntime?: Date;
  incidents: number;
}

/**
 * Dashboard API functions
 */
export const dashboardApi = {
  /**
   * Get overall dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get('/api/dashboard/stats');
  },

  /**
   * Get performance metrics over time
   */
  getPerformanceMetrics: async (
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<PerformanceMetrics[]> => {
    return apiClient.get('/api/dashboard/performance', {
      params: { timeRange }
    });
  },

  /**
   * Get device availability data
   */
  getAvailabilityData: async (): Promise<AvailabilityData[]> => {
    return apiClient.get('/api/dashboard/availability');
  },

  /**
   * Get system health summary
   */
  getSystemHealth: async () => {
    return apiClient.get('/api/dashboard/health');
  },
};
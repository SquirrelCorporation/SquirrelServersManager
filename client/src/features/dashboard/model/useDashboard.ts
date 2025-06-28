import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@app/store';
import { dashboardApi, DashboardStats, PerformanceMetrics, AvailabilityData } from '../api/dashboard';

/**
 * Hook for dashboard statistics with real-time updates
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardApi.getStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true,
  });
};

/**
 * Hook for performance metrics with configurable time range
 */
export const usePerformanceMetrics = (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.performance, timeRange],
    queryFn: () => dashboardApi.getPerformanceMetrics(timeRange),
    staleTime: timeRange === '1h' ? 60 * 1000 : 5 * 60 * 1000, // 1 min for 1h, 5 min for others
    refetchInterval: timeRange === '1h' ? 30 * 1000 : undefined, // Auto-refresh for real-time view
  });
};

/**
 * Hook for device availability data
 */
export const useAvailabilityData = () => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.availability],
    queryFn: dashboardApi.getAvailabilityData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

/**
 * Composite hook that combines all dashboard data
 */
export const useDashboardData = (performanceTimeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
  const statsQuery = useDashboardStats();
  const performanceQuery = usePerformanceMetrics(performanceTimeRange);
  const availabilityQuery = useAvailabilityData();

  const isLoading = statsQuery.isLoading || performanceQuery.isLoading || availabilityQuery.isLoading;
  const hasError = statsQuery.error || performanceQuery.error || availabilityQuery.error;

  // Compute derived data
  const computedData = {
    // System health score based on various metrics
    systemHealthScore: statsQuery.data ? 
      calculateSystemHealth(
        statsQuery.data,
        availabilityQuery.data || []
      ) : 0,
    
    // Performance trends
    performanceTrends: performanceQuery.data ? 
      calculatePerformanceTrends(performanceQuery.data) : null,
    
    // Critical alerts count
    criticalAlertsCount: statsQuery.data ? 
      (statsQuery.data.devices.offline + statsQuery.data.containers.failed) : 0,
  };

  return {
    // Raw data
    stats: statsQuery.data,
    performance: performanceQuery.data,
    availability: availabilityQuery.data,
    
    // Computed data
    ...computedData,
    
    // Loading states
    isLoading,
    hasError,
    
    // Individual query states
    statsQuery,
    performanceQuery,
    availabilityQuery,
    
    // Refresh functions
    refetchAll: () => {
      statsQuery.refetch();
      performanceQuery.refetch();
      availabilityQuery.refetch();
    },
  };
};

/**
 * Calculate overall system health score (0-100)
 */
function calculateSystemHealth(stats: DashboardStats, availability: AvailabilityData[]): number {
  if (!stats || !availability.length) return 0;

  // Device health component (40% weight)
  const deviceHealth = stats.devices.total > 0 
    ? (stats.devices.online / stats.devices.total) * 100 
    : 100;

  // Container health component (30% weight)
  const containerHealth = stats.containers.total > 0 
    ? (stats.containers.running / stats.containers.total) * 100 
    : 100;

  // Availability component (30% weight)
  const avgAvailability = availability.length > 0
    ? availability.reduce((sum, device) => sum + device.availability, 0) / availability.length
    : 100;

  // Weighted average
  const overallHealth = (deviceHealth * 0.4) + (containerHealth * 0.3) + (avgAvailability * 0.3);
  
  return Math.round(overallHealth);
}

/**
 * Calculate performance trends
 */
function calculatePerformanceTrends(metrics: PerformanceMetrics[]) {
  if (metrics.length < 2) return null;

  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];

  return {
    cpu: {
      current: latest.cpu,
      trend: latest.cpu - previous.cpu,
      direction: latest.cpu > previous.cpu ? 'up' : latest.cpu < previous.cpu ? 'down' : 'stable'
    },
    memory: {
      current: latest.memory,
      trend: latest.memory - previous.memory,
      direction: latest.memory > previous.memory ? 'up' : latest.memory < previous.memory ? 'down' : 'stable'
    },
    disk: {
      current: latest.disk,
      trend: latest.disk - previous.disk,
      direction: latest.disk > previous.disk ? 'up' : latest.disk < previous.disk ? 'down' : 'stable'
    }
  };
}
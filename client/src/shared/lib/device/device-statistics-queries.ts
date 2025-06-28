/**
 * Device Statistics TanStack Query Hooks
 * Integrates device statistics business logic with TanStack Query
 */

import { useQuery } from '@tanstack/react-query';
import { getDeviceStat, getDeviceStats } from '@/services/rest/statistics/stastistics';
import { StatsType, API } from 'ssm-shared-lib';
import moment from 'moment';
import { 
  validateStatisticValue, 
  formatStatisticDate,
  getStatisticDisplayConfig,
  generateStatisticTooltip,
  type StatisticDisplayConfig 
} from './device-statistics';
import { queryKeys } from '@shared/lib/query-keys/query-keys';

export interface DeviceStatisticResult {
  value: number | null;
  displayValue: string;
  date: string;
  config: StatisticDisplayConfig;
  tooltipText: string;
  hasError: boolean;
  isLoading: boolean;
}

/**
 * Hook to fetch and format device statistics
 */
export function useDeviceStatistic(
  deviceUuid: string | undefined,
  type: StatsType.DeviceStatsType,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
): DeviceStatisticResult {
  const config = getStatisticDisplayConfig(type);
  
  const query = useQuery({
    queryKey: queryKeys.devices.nested(['statistics', deviceUuid, type]),
    queryFn: async () => {
      if (!deviceUuid) throw new Error('Device UUID is required');
      const response = await getDeviceStat(deviceUuid, type, {});
      return response.data;
    },
    enabled: !!deviceUuid && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? 30000, // 30 seconds default
    staleTime: 15000, // 15 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404s (device not found)
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Process the raw data
  const processedData = (() => {
    const hasError = query.isError || !query.data;
    
    if (hasError || !query.data) {
      return {
        value: null,
        displayValue: 'N/A',
        date: 'Error',
        hasError: true,
      };
    }

    const { isValid, normalizedValue } = validateStatisticValue(query.data.value);
    
    if (!isValid) {
      return {
        value: null,
        displayValue: 'Invalid',
        date: 'Invalid data',
        hasError: true,
      };
    }

    const formattedDate = formatStatisticDate(query.data.date);
    
    return {
      value: normalizedValue,
      displayValue: `${Math.round(normalizedValue!)}%`,
      date: formattedDate,
      hasError: false,
    };
  })();

  const tooltipText = generateStatisticTooltip(
    config,
    processedData.value,
    processedData.date,
    processedData.hasError
  );

  return {
    ...processedData,
    config,
    tooltipText,
    isLoading: query.isLoading,
  };
}

/**
 * Hook to fetch multiple device statistics at once
 */
export function useDeviceStatistics(
  deviceUuid: string | undefined,
  types: StatsType.DeviceStatsType[],
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
): Record<StatsType.DeviceStatsType, DeviceStatisticResult> {
  const results = {} as Record<StatsType.DeviceStatsType, DeviceStatisticResult>;
  
  types.forEach(type => {
    // Use the hook for each type
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[type] = useDeviceStatistic(deviceUuid, type, options);
  });
  
  return results;
}

/**
 * Hook specifically for the common CPU/Memory/Disk trio
 */
export function useDeviceResourceStatistics(
  deviceUuid: string | undefined,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
) {
  return useDeviceStatistics(
    deviceUuid,
    [
      StatsType.DeviceStatsType.CPU,
      StatsType.DeviceStatsType.MEM_USED,
      StatsType.DeviceStatsType.DISK_USED,
    ],
    options
  );
}

/**
 * Interface for formatted historical chart data
 */
export interface ChartDataPoint {
  date: string;
  value: number;
}

/**
 * Hook to fetch historical device statistics for charts
 */
export function useDeviceHistoricalStats(
  deviceUuid: string | undefined,
  type: StatsType.DeviceStatsType,
  options?: {
    from?: number;
    refetchInterval?: number;
    enabled?: boolean;
  }
): {
  data: ChartDataPoint[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const query = useQuery({
    queryKey: queryKeys.devices.nested(['historicalStats', deviceUuid, type, options?.from]),
    queryFn: async () => {
      if (!deviceUuid) throw new Error('Device UUID is required');
      const response = await getDeviceStats(deviceUuid, type, { 
        from: options?.from || 0 
      });
      return response;
    },
    enabled: !!deviceUuid && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? 60000, // 1 minute default for historical data
    staleTime: 30000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
    select: (data: API.DeviceStats) => {
      if (!data?.data) return [];

      // Format and deduplicate data
      const formattedData = data.data.map((item) => ({
        date: moment(item.date, 'YYYY-MM-DD-HH-mm-ss').format('YYYY-MM-DD, HH:mm'),
        value: parseFloat((item.value / 100).toFixed(2)), // Convert to percentage
      }));

      // Remove duplicates by date, keeping the last occurrence
      const uniqueData = Array.from(
        new Map(formattedData.map(item => [item.date, item])).values()
      );

      return uniqueData;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
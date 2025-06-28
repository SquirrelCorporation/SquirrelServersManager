import React from 'react';
import { StatsType } from 'ssm-shared-lib';
import { useDeviceStatistic } from '@shared/lib/device/device-statistics-queries';
import CountIndicator from './CountIndicator';

export interface CountIndicatorWithDataProps {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
  size?: number;
  label?: string;
  refreshInterval?: number;
  onDataFetch?: (value: number | null, date: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Count Indicator with automatic data fetching
 * Displays device statistics as count values using TanStack Query
 */
const CountIndicatorWithData: React.FC<CountIndicatorWithDataProps> = ({
  deviceUuid,
  type,
  size = 46,
  label = 'CTX',
  refreshInterval = 30000,
  onDataFetch,
  className,
  style,
}) => {
  // Fetch device statistic using TanStack Query
  const statisticResult = useDeviceStatistic(deviceUuid, type, {
    refetchInterval,
    enabled: !!deviceUuid,
  });

  // Call onDataFetch callback when data changes
  React.useEffect(() => {
    if (onDataFetch && !statisticResult.isLoading) {
      onDataFetch(statisticResult.value, statisticResult.date);
    }
  }, [statisticResult.value, statisticResult.date, statisticResult.isLoading, onDataFetch]);

  const tooltipText = 
    statisticResult.date !== 'never' && 
    statisticResult.date !== 'error' && 
    statisticResult.date !== 'invalid data'
      ? `Updated at ${statisticResult.date}`
      : 'Failed to load data';

  return (
    <CountIndicator
      key={`${deviceUuid}-${type}`}
      count={statisticResult.value}
      size={size}
      isLoading={statisticResult.isLoading}
      tooltipText={tooltipText}
      label={label}
      className={className}
      style={style}
    />
  );
};

export default React.memo(CountIndicatorWithData);
import React, { useMemo } from 'react';
import { StatsType } from 'ssm-shared-lib';
import { LaptopOutlined, HddOutlined } from '@ant-design/icons';
import { WhhCpu, WhhRam } from '@shared/ui/icons';
import { useDeviceStatistic } from '@shared/lib/device/device-statistics-queries';
import UnifiedRingProgress from './UnifiedRingProgress';

export interface RingProgressWithDataProps {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  refreshInterval?: number; // Auto refresh interval in ms
  onDataFetch?: (value: number | null, date: string) => void; // Callback when data is fetched
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ring Progress component that automatically fetches and displays device statistics
 * Integrates with TanStack Query for optimal caching and real-time updates
 */
const RingProgressWithData: React.FC<RingProgressWithDataProps> = ({
  deviceUuid,
  type,
  size = 50,
  strokeWidth = 4,
  showText = true,
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

  // Get appropriate icon based on statistic type
  const icon = useMemo(() => {
    switch (statisticResult.config.iconName) {
      case 'cpu':
        return <WhhCpu />;
      case 'ram':
        return <WhhRam />;
      case 'hdd':
        return <HddOutlined />;
      case 'laptop':
      default:
        return <LaptopOutlined />;
    }
  }, [statisticResult.config.iconName]);

  return (
    <UnifiedRingProgress
      key={`${deviceUuid}-${type}`}
      percent={statisticResult.value || 0}
      type={statisticResult.config.ringType}
      size={size}
      strokeWidth={strokeWidth}
      showText={showText}
      tooltipText={statisticResult.tooltipText}
      icon={icon}
      loading={statisticResult.isLoading}
      error={statisticResult.hasError}
      warningThreshold={statisticResult.config.warningThreshold}
      dangerThreshold={statisticResult.config.dangerThreshold}
      className={className}
      style={style}
    />
  );
};

export default React.memo(RingProgressWithData);
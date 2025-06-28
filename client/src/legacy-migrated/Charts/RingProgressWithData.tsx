import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getDeviceStat } from '@/services/rest/statistics/stastistics';
import message from '@/components/Message/DynamicMessage';
import moment from 'moment';
import { StatsType } from 'ssm-shared-lib';
import UnifiedRingProgress from './UnifiedRingProgress';
import type { RingProgressType } from './UnifiedRingProgress';
import { LaptopOutlined, HddOutlined } from '@ant-design/icons';
import { WhhCpu, WhhRam } from '@/components/Icons/CustomIcons';

export interface RingProgressWithDataProps {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  refreshInterval?: number; // Auto refresh interval in ms
  onDataFetch?: (value: number | null, date: string) => void; // Callback when data is fetched
}

const RingProgressWithData: React.FC<RingProgressWithDataProps> = ({
  deviceUuid,
  type,
  size = 50,
  strokeWidth = 4,
  showText = true,
  refreshInterval,
  onDataFetch,
}) => {
  const [value, setValue] = useState<number | null>(null);
  const [date, setDate] = useState<string>('never');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const asyncFetch = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    
    try {
      const res = await getDeviceStat(deviceUuid, type, {});

      if (res.data && typeof res.data.value === 'number') {
        const percentValue = res.data.value;
        if (!isNaN(percentValue)) {
          setValue(percentValue);
          const formattedDate = moment(res.data.date).format('YYYY-MM-DD, HH:mm');
          setDate(formattedDate);
          onDataFetch?.(percentValue, formattedDate);
        } else {
          console.warn(`NaN value received for ${type} on ${deviceUuid}`);
          setValue(null);
          setDate('invalid data');
          setError(true);
          onDataFetch?.(null, 'invalid data');
        }
      } else {
        console.warn(`Invalid data structure for ${type} on ${deviceUuid}`);
        setValue(null);
        setDate('invalid data');
        setError(true);
        onDataFetch?.(null, 'invalid data');
      }
    } catch (error: any) {
      console.error(`Error fetching ${type} for ${deviceUuid}:`, error);
      message.error({ content: `Failed to fetch ${type} stats`, duration: 5 });
      setValue(null);
      setDate('error');
      setError(true);
      onDataFetch?.(null, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [deviceUuid, type, onDataFetch]);

  useEffect(() => {
    void asyncFetch();
    
    // Set up auto refresh if interval is provided
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        void asyncFetch();
      }, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [asyncFetch, refreshInterval]);

  // Determine ring type and icon based on stats type
  const { ringType, icon, label } = useMemo(() => {
    switch (type) {
      case StatsType.DeviceStatsType.CPU:
        return {
          ringType: 'cpu' as RingProgressType,
          icon: <WhhCpu />,
          label: 'CPU',
        };
      case StatsType.DeviceStatsType.MEM_USED:
        return {
          ringType: 'memory' as RingProgressType,
          icon: <WhhRam />,
          label: 'Memory',
        };
      case StatsType.DeviceStatsType.DISK_USED:
        return { 
          ringType: 'disk' as RingProgressType, 
          icon: <HddOutlined />,
          label: 'Disk',
        };
      default:
        return {
          ringType: 'custom' as RingProgressType,
          icon: <LaptopOutlined />,
          label: 'System',
        };
    }
  }, [type]);

  // Generate tooltip text
  const tooltipText = useMemo(() => {
    if (error || value === null) {
      return 'Failed to load data';
    }
    return `${label} (Updated at ${date})`;
  }, [error, value, label, date]);

  return (
    <UnifiedRingProgress
      key={`${deviceUuid}-${type}`}
      percent={value || 0}
      type={ringType}
      size={size}
      strokeWidth={strokeWidth}
      showText={showText}
      tooltipText={tooltipText}
      icon={icon}
      loading={isLoading}
      error={error}
    />
  );
};

export default React.memo(RingProgressWithData);
import { getDeviceStat } from '@/services/rest/stastistics';
import message from '@/components/Message/DynamicMessage';
import { Skeleton } from 'antd';
import moment from 'moment';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StatsType } from 'ssm-shared-lib';
import CustomRingProgress from './CustomRingProgress';
import type { RingProgressType } from './CustomRingProgress';
import { LaptopOutlined, HddOutlined } from '@ant-design/icons';

export type TinyRingProps = {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
};

const TinyRingProgressDeviceGraph: React.FC<TinyRingProps> = ({
  deviceUuid,
  type,
}) => {
  const [value, setValue] = useState<number | null>(null);
  const [date, setDate] = useState<string>('never');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const asyncFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getDeviceStat(deviceUuid, type, {});

      if (res.data && typeof res.data.value === 'number') {
        const percentValue = res.data.value;
        if (!isNaN(percentValue)) {
          setValue(percentValue);
          setDate(moment(res.data.date).format('YYYY-MM-DD, HH:mm'));
        } else {
          console.warn(`NaN value received for ${type} on ${deviceUuid}`);
          setValue(NaN);
          setDate('invalid data');
        }
      } else {
        console.warn(`Invalid data structure for ${type} on ${deviceUuid}`);
        setValue(NaN);
        setDate('invalid data');
      }
    } catch (error: any) {
      console.error(`Error fetching ${type} for ${deviceUuid}:`, error);
      message.error({ content: `Failed to fetch ${type} stats`, duration: 5 });
      setValue(NaN);
      setDate('error');
    } finally {
      setIsLoading(false);
    }
  }, [deviceUuid, type]);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  const { ringType, icon } = useMemo(() => {
    switch (type) {
      case StatsType.DeviceStatsType.CPU:
        return {
          ringType: 'cpu' as RingProgressType,
          icon: <LaptopOutlined />,
        };
      case StatsType.DeviceStatsType.MEM_USED:
        return {
          ringType: 'memory' as RingProgressType,
          icon: <HddOutlined />,
        };
      case StatsType.DeviceStatsType.DISK_USED:
        return { ringType: 'disk' as RingProgressType, icon: <HddOutlined /> };
      default:
        return {
          ringType: 'cpu' as RingProgressType,
          icon: <LaptopOutlined />,
        };
    }
  }, [type]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton.Avatar active size={50} shape="circle" />;
    }

    const tooltipText =
      value === null || isNaN(value)
        ? 'Failed to load data'
        : `${type === StatsType.DeviceStatsType.CPU ? 'CPU' : type === StatsType.DeviceStatsType.MEM_USED ? 'Memory' : 'Disk'} (Updated at ${date})`;

    const errorIcon =
      type === StatsType.DeviceStatsType.CPU ? (
        <LaptopOutlined />
      ) : (
        <HddOutlined />
      );

    if (value === null || isNaN(value)) {
      return (
        <CustomRingProgress
          percent={0}
          type="disk"
          size={50}
          strokeWidth={4}
          showText={true}
          tooltipText={tooltipText}
          icon={errorIcon}
        />
      );
    }

    return (
      <CustomRingProgress
        key={`${deviceUuid}-${type}`}
        percent={value}
        type={ringType}
        size={50}
        strokeWidth={4}
        showText={true}
        tooltipText={tooltipText}
        icon={icon}
      />
    );
  };

  return renderContent();
};

export default React.memo(TinyRingProgressDeviceGraph);

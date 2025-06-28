import React, { useMemo } from 'react';
import { Tiny } from '@ant-design/charts';
import { StatsType } from 'ssm-shared-lib';
import { useDeviceHistoricalStats } from '@shared/lib/device/device-statistics-queries';
import { Skeleton } from 'antd';

export interface TinyLineChartProps {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
  from: number;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tiny line chart component for displaying device statistics over time
 * Uses TanStack Query for data fetching and caching
 */
const TinyLineChart: React.FC<TinyLineChartProps> = ({
  deviceUuid,
  type,
  from,
  width = 280,
  height = 55,
  strokeWidth = 4,
  className,
  style,
}) => {
  // Fetch historical statistics
  const { data, isLoading, isError } = useDeviceHistoricalStats(
    deviceUuid,
    type,
    { from }
  );

  // Configuration for the chart
  const config = useMemo(
    () => ({
      data: data || [],
      autoFit: false,
      width,
      height,
      shapeField: 'smooth',
      xField: 'date',
      yField: 'value',
      padding: 10,
      tooltip: { 
        channel: 'y', 
        valueFormatter: '.2%' 
      },
      interaction: { 
        tooltip: { mount: 'body' } 
      },
      style: {
        lineWidth: strokeWidth,
      },
    }),
    [data, width, height, strokeWidth]
  );

  if (isLoading) {
    return (
      <div className={className} style={style}>
        <Skeleton.Input active size="small" style={{ width, height }} />
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div 
        className={className} 
        style={{ 
          ...style, 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px',
        }}
      >
        No data
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Tiny.Line {...config} />
    </div>
  );
};

export default React.memo(TinyLineChart);
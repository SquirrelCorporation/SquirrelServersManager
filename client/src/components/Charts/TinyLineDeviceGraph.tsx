import { getDeviceStats } from '@/services/rest/statistics/stastistics';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import message from '@/components/Message/DynamicMessage';
import moment from 'moment';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { API, StatsType } from 'ssm-shared-lib';

export type TinyLineProps = {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
  from: number;
};

const TinyLineDeviceGraph: React.FC<TinyLineProps> = ({
  deviceUuid,
  type,
  from,
}) => {
  const [data, setData] = useState<API.DeviceStat[]>([]);

  const formatData = useCallback((list: API.DeviceStats) => {
    if (!list?.data) {
      return [];
    }

    const formattedData = list.data.map((e) => ({
      date: moment(e.date, 'YYYY-MM-DD-HH-mm-ss').format('YYYY-MM-DD, HH:mm'),
      value: parseFloat((e.value / 100).toFixed(2)),
    }));

    return Array.from(new Set(formattedData.map((d) => d.date))).map(
      (date) => formattedData.find((d) => d.date === date) as API.DeviceStat,
    );
  }, []);

  const asyncFetch = useCallback(async () => {
    try {
      console.log('📊 TinyLineDeviceGraph API Call: getDeviceStats', { 
        component: 'TinyLineDeviceGraph',
        deviceId: deviceUuid,
        statsType: type,
        from,
        timestamp: new Date().toISOString()
      });
      const list = await getDeviceStats(deviceUuid, type, { from });
      console.log('📊 TinyLineDeviceGraph API Response: getDeviceStats', { 
        component: 'TinyLineDeviceGraph',
        deviceId: deviceUuid,
        statsType: type,
        dataLength: list?.data?.length || 0,
        rawData: list?.data,
        timestamp: new Date().toISOString()
      });
      setData(formatData(list));
    } catch (error: any) {
      console.error('📊 TinyLineDeviceGraph API Error: getDeviceStats', { 
        component: 'TinyLineDeviceGraph',
        deviceId: deviceUuid,
        statsType: type,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
      message.error({
        content: error?.message || 'Unknown error',
        duration: 6,
      });
    }
  }, [deviceUuid, type, from, formatData]);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  // Prepare data for ApexCharts
  const chartData = useMemo(() => {
    return data.map(item => item.value * 100); // Convert back to percentage
  }, [data]);

  const categories = useMemo(() => {
    return data.map(item => item.date);
  }, [data]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 4
    },
    colors: ['#52c41a'],
    xaxis: {
      categories: categories,
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    grid: {
      show: false,
      padding: {
        top: 10,
        right: 0,
        bottom: 10,
        left: 0
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        title: {
          formatter: () => 'CPU'
        },
        formatter: (value) => `${value.toFixed(2)}%`
      },
      marker: {
        show: false
      },
      fixed: {
        enabled: true,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0
      }
    }
  };

  const series = [{
    name: 'CPU',
    data: chartData
  }];

  return (
    <div style={{ width: '280px', height: '55px' }}>
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="line"
        height={55}
        width={280}
      />
    </div>
  );
};

export default React.memo(TinyLineDeviceGraph);
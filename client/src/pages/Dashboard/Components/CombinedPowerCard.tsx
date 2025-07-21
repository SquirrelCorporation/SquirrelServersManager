import { InfoCircleFilled } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Tooltip, Typography, Card, Skeleton, Space } from 'antd';
import React, { useState, useMemo } from 'react';
import { API } from 'ssm-shared-lib';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Devicestatus from '@/utils/devicestatus';
import { getPaletteColors, getSemanticColors } from './utils/colorPalettes';

interface CombinedPowerCardProps {
  colorPalette?: string;
  customColors?: string[];
}

const CombinedPowerCard: React.FC<CombinedPowerCardProps> = ({
  colorPalette = 'default',
  customColors = [],
}) => {
  const [loading] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};

  const totalCpu = currentUser?.devices?.totalCpu || 0;
  const totalMem = currentUser?.devices?.totalMem || 0;
  const totalMemGB = totalMem / (1024 * 1024 * 1024);

  // Calculate CPU and Memory distribution for pie charts
  const { cpuSeries, cpuLabels, memSeries, memLabels } = useMemo(() => {
    const devices = currentUser?.devices?.overview?.filter((e) => e.status !== Devicestatus.UNMANAGED) || [];
    
    const cpuData = devices.map(device => ({
      name: device.name || 'Unknown',
      value: device.cpu || 0
    })).filter(d => d.value > 0);

    const memData = devices.map(device => ({
      name: device.name || 'Unknown',
      value: (device.mem || 0) / (1024 * 1024 * 1024) // Convert to GB
    })).filter(d => d.value > 0);

    return {
      cpuSeries: cpuData.map(d => d.value),
      cpuLabels: cpuData.map(d => d.name),
      memSeries: memData.map(d => d.value),
      memLabels: memData.map(d => d.name)
    };
  }, [currentUser]);

  // Get colors from palette
  const colors = useMemo(() => {
    return customColors && customColors.length > 0 ? customColors : getPaletteColors(colorPalette);
  }, [colorPalette, customColors]);

  // Get semantic colors from palette
  const semanticColors = useMemo(() => {
    return getSemanticColors(colorPalette);
  }, [colorPalette]);

  const pieChartOptions = (labels: string[], chartId: string): ApexOptions => ({
    chart: {
      id: chartId,
      type: 'donut',
      width: 60,
      height: 60,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: false
      }
    },
    colors: colors,
    labels: labels,
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent'
        }
      }
    },
    stroke: {
      width: 1,
      colors: ['#1a1a1a']
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => {
          return value.toFixed(1);
        }
      },
      style: {
        fontSize: '12px'
      },
      custom: function({ series, seriesIndex, w }) {
        const value = series[seriesIndex];
        const label = w.config.labels[seriesIndex];
        const color = w.config.colors[seriesIndex];
        const total = series.reduce((a: number, b: number) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        
        return `
          <div style="padding: 8px; background: #1a1a1a; border: 1px solid #3a3a3e; border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <div style="width: 10px; height: 10px; background: ${color}; border-radius: 2px; margin-right: 6px;"></div>
              <span style="color: #d9d9d9; font-size: 12px;">${label}</span>
            </div>
            <div style="color: #ffffff; font-size: 12px; font-weight: 500;">
              ${value.toFixed(1)} ${w.config.chart?.id === 'cpu-chart' ? 'GHz' : 'GB'} (${percentage}%)
            </div>
          </div>`;
      }
    }
  });

  if (loading) {
    return (
      <Card
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          border: 'none',
          height: '180px',
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        height: '180px',
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography.Title level={5} style={{ color: '#ffffff', margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Combined Power
        </Typography.Title>
        <Tooltip title="Distribution of resources across your devices">
          <InfoCircleFilled style={{ color: '#8c8c8c', fontSize: '14px' }} />
        </Tooltip>
      </div>

      {/* Combined Stats with Pie Charts */}
      <div>
        {/* Values Row */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'baseline', marginBottom: '12px' }}>
          {/* CPU */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <Typography.Text style={{ color: semanticColors.primary, fontSize: '24px', fontWeight: 600 }}>
              {totalCpu.toFixed(1)}
            </Typography.Text>
            <Typography.Text style={{ color: semanticColors.primary, fontSize: '14px' }}>
              GHz
            </Typography.Text>
          </div>

          {/* Memory */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <Typography.Text style={{ color: semanticColors.secondary, fontSize: '24px', fontWeight: 600 }}>
              {totalMemGB.toFixed(0)}
            </Typography.Text>
            <Typography.Text style={{ color: semanticColors.secondary, fontSize: '14px' }}>
              GB
            </Typography.Text>
          </div>
        </div>

        {/* Pie Charts Row */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {/* CPU Pie */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {cpuSeries.length > 0 && (
              <ReactApexChart
                options={pieChartOptions(cpuLabels, 'cpu-chart')}
                series={cpuSeries}
                type="donut"
                width={60}
                height={60}
              />
            )}
          </div>

          {/* Memory Pie */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {memSeries.length > 0 && (
              <ReactApexChart
                options={pieChartOptions(memLabels, 'mem-chart')}
                series={memSeries}
                type="donut"
                width={60}
                height={60}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(CombinedPowerCard);
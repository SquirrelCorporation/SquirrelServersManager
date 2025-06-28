import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { Line } from '@ant-design/plots';
import { PerformanceMetrics } from '../../../api/dashboard';

const { Title, Text } = Typography;

interface PerformanceChartProps {
  data: PerformanceMetrics[];
  timeRange: '1h' | '24h' | '7d' | '30d';
  trends?: {
    cpu: { current: number; trend: number; direction: 'up' | 'down' | 'stable' };
    memory: { current: number; trend: number; direction: 'up' | 'down' | 'stable' };
    disk: { current: number; trend: number; direction: 'up' | 'down' | 'stable' };
  } | null;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  timeRange, 
  trends 
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <div style={{ padding: '40px 0' }}>
          <Empty 
            description="No performance data available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = data.flatMap(metric => [
    {
      timestamp: new Date(metric.timestamp).getTime(),
      value: metric.cpu,
      category: 'CPU',
      displayValue: `${metric.cpu.toFixed(1)}%`
    },
    {
      timestamp: new Date(metric.timestamp).getTime(),
      value: metric.memory,
      category: 'Memory',
      displayValue: `${metric.memory.toFixed(1)}%`
    },
    {
      timestamp: new Date(metric.timestamp).getTime(),
      value: metric.disk,
      category: 'Disk',
      displayValue: `${metric.disk.toFixed(1)}%`
    }
  ]);

  const config = {
    data: chartData,
    xField: 'timestamp',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#1890ff', '#52c41a', '#faad14'],
    xAxis: {
      type: 'time',
      tickCount: timeRange === '1h' ? 6 : timeRange === '24h' ? 8 : 7,
      label: {
        formatter: (text: string) => {
          const date = new Date(parseInt(text));
          if (timeRange === '1h') {
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          } else if (timeRange === '24h') {
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          } else {
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
        },
      },
    },
    yAxis: {
      max: 100,
      label: {
        formatter: (text: string) => `${text}%`,
      },
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.category,
        value: datum.displayValue,
      }),
    },
    legend: {
      position: 'top-right',
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    lineStyle: {
      lineWidth: 2,
    },
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable', value: number) => {
    if (direction === 'stable') return '#666';
    if (value > 80) return direction === 'up' ? '#ff4d4f' : '#52c41a';
    if (value > 60) return direction === 'up' ? '#faad14' : '#1890ff';
    return direction === 'up' ? '#1890ff' : '#666';
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          System Performance
        </Title>
        {trends && (
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>CPU</Text>
              <div style={{ 
                color: getTrendColor(trends.cpu.direction, trends.cpu.current),
                fontWeight: 'bold' 
              }}>
                {getTrendIcon(trends.cpu.direction)} {trends.cpu.current.toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>Memory</Text>
              <div style={{ 
                color: getTrendColor(trends.memory.direction, trends.memory.current),
                fontWeight: 'bold' 
              }}>
                {getTrendIcon(trends.memory.direction)} {trends.memory.current.toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>Disk</Text>
              <div style={{ 
                color: getTrendColor(trends.disk.direction, trends.disk.current),
                fontWeight: 'bold' 
              }}>
                {getTrendIcon(trends.disk.direction)} {trends.disk.current.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: '300px' }}>
        <Line {...config} />
      </div>
    </Card>
  );
};
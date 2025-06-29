import React from 'react';
import { Card, Typography, Space } from 'antd';
import { Column } from '@ant-design/charts';

interface VisitEntry {
  month: string;
  team: string;
  visits: number;
}

interface WebsiteVisitsBarChartCardProps {
  title: string;
  subtitle: string;
  chartData: VisitEntry[];
  categoryColors: Record<string, string>;
  cardStyle?: React.CSSProperties;
}

const WebsiteVisitsBarChartCard: React.FC<WebsiteVisitsBarChartCardProps> = ({
  title,
  subtitle,
  chartData,
  categoryColors,
  cardStyle,
}) => {
  const columnConfig = {
    data: chartData,
    isGroup: true,
    xField: 'month',
    yField: 'visits',
    seriesField: 'team',
    dodgePadding: 2,
    marginRatio: 0.1,
    height: 300,
    color: ['#52c41a', '#faad14'],
    xAxis: {
      label: { 
        style: { 
          fill: '#8c8c8c', 
          fontSize: 12 
        } 
      },
      line: { 
        style: { 
          stroke: '#3a3a3e' 
        } 
      },
    },
    yAxis: {
      label: { 
        style: { 
          fill: '#8c8c8c', 
          fontSize: 11 
        } 
      },
      grid: { 
        line: { 
          style: { 
            stroke: '#3a3a3e', 
            lineDash: [4, 4],
            opacity: 0.3
          } 
        } 
      },
      max: 80,
      tickInterval: 20,
    },
    legend: false,
    tooltip: {
      shared: true,
      showMarkers: false,
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        color: 'white',
        border: 'none',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '28px 32px' }}
    >
      <Space direction="vertical" size={4} style={{ marginBottom: '24px' }}>
        <Typography.Title
          level={4}
          style={{ 
            color: '#ffffff', 
            margin: 0, 
            fontSize: '20px',
            fontWeight: 600 
          }}
        >
          {title}
        </Typography.Title>
        <Typography.Text style={{ 
          color: '#52c41a', 
          fontSize: '14px',
          opacity: 0.8
        }}>
          {subtitle}
        </Typography.Text>
      </Space>
      
      {/* Legend */}
      <Space size={24} style={{ marginBottom: '24px', float: 'right' }}>
        <Space size={8} align="center">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#52c41a' }} />
          <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>Team A</Typography.Text>
        </Space>
        <Space size={8} align="center">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#faad14' }} />
          <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>Team B</Typography.Text>
        </Space>
      </Space>
      
      <div style={{ clear: 'both' }}>
        <Column {...columnConfig} />
      </div>
    </Card>
  );
};

export default WebsiteVisitsBarChartCard;

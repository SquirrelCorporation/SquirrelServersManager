import React from 'react';
import { Card, Typography, Space, Select, Row, Col } from 'antd';
import { Column } from '@ant-design/charts';
import type { ColumnConfig } from '@ant-design/plots';

interface InstallData {
  month: string; // Or other time unit
  region: string; // e.g. "Asia", "Europe"
  installs: number;
}

interface AreaInstalledBarChartCardProps {
  title: string;
  subtitle: string;
  currentYear: string | number;
  availableYears: Array<string | number>;
  onYearChange: (year: string | number) => void;
  chartData: InstallData[];
  regionColors: Record<string, string>; // e.g. { Asia: '#ffc53d', Europe: '#40a9ff', Americas: '#52c41a' }
  cardStyle?: React.CSSProperties;
}

const AreaInstalledBarChartCard: React.FC<AreaInstalledBarChartCardProps> = ({
  title,
  subtitle,
  currentYear,
  availableYears,
  onYearChange,
  chartData,
  regionColors,
  cardStyle,
}) => {
  const columnConfig: ColumnConfig = {
    data: chartData,
    isStack: true,
    xField: 'month',
    yField: 'installs',
    seriesField: 'region',
    colorField: 'region',
    height: 300,
    color: ['#52c41a', '#faad14', '#1890ff'],
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
      <Row
        justify="space-between"
        align="top"
        style={{ marginBottom: '24px' }}
      >
        <Col>
          <Space direction="vertical" size={4}>
            <Typography.Title
              level={4}
              style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: 600 }}
            >
              {title}
            </Typography.Title>
            <Typography.Text style={{ color: '#52c41a', fontSize: '14px', opacity: 0.8 }}>
              {subtitle}
            </Typography.Text>
          </Space>
        </Col>
        <Col>
          <Select
            value={currentYear}
            onChange={onYearChange}
            options={availableYears.map((y) => ({
              label: y.toString(),
              value: y,
            }))}
            style={{ width: 100 }}
          />
        </Col>
      </Row>
      
      {/* Legend */}
      <Space size={24} style={{ marginBottom: '24px' }}>
        <Space size={8} align="center">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#52c41a' }} />
          <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>Asia</Typography.Text>
        </Space>
        <Space size={8} align="center">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#faad14' }} />
          <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>Europe</Typography.Text>
        </Space>
        <Space size={8} align="center">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1890ff' }} />
          <Typography.Text style={{ color: '#d9d9d9', fontSize: 13 }}>Americas</Typography.Text>
        </Space>
      </Space>
      
      
      <Column {...columnConfig} />
    </Card>
  );
};

export default AreaInstalledBarChartCard;

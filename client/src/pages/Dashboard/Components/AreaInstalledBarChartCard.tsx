import React from 'react';
import { Card, Typography, Space, Select, Row, Col } from 'antd';
import { Column, ColumnConfig, Datum } from '@ant-design/plots';

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
    isGroup: true,
    xField: 'month',
    yField: 'installs',
    seriesField: 'region',
    dodgePadding: 4,
    marginRatio: 0.1,
    height: 250, // Adjusted height slightly from 260 to fit typical card proportions
    color: ({ region }: any) => regionColors[region] || '#8c8c8c',
    xAxis: {
      label: { style: { fill: '#8c8c8c', fontSize: 11 } },
      line: { style: { stroke: '#3a3a3e' } },
    },
    yAxis: {
      label: { style: { fill: '#8c8c8c', fontSize: 11 } },
      grid: { line: { style: { stroke: '#3a3a3e', lineDash: [3, 3] } } },
      splitNumber: 4, // Adjusted for cleaner look based on screenshot density
    },
    legend: {
      position: 'top-right',
      itemName: { style: { fill: '#d9d9d9', fontSize: 12 } },
      marker: (name: string, index: number, item: Datum) => {
        return {
          symbol: 'square',
          style: {
            fill: regionColors[item.name as string] || '#8c8c8c',
            r: 5,
          },
        };
      },
    },
    tooltip: {
      shared: true,
      showMarkers: false,
      domStyles: {
        'g2-tooltip': {
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
          borderRadius: '4px',
          padding: '8px 12px',
        },
      },
    },
    columnStyle: {
      radius: [3, 3, 0, 0],
    },
  };

  return (
    <Card
      style={{
        backgroundColor: '#222225', // Matched background
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Consistent shadow
        ...cardStyle,
      }}
      bodyStyle={{ padding: '20px 24px 24px 24px' }} // Standardized padding
    >
      <Row
        justify="space-between"
        align="top" // Align items to the top for title/subtitle and select
        style={{ marginBottom: '16px' }} // Spacing below header
      >
        <Col>
          <Space direction="vertical" size={2}>
            <Typography.Title
              level={4}
              style={{ color: '#f0f0f0', margin: 0, fontWeight: 500 }}
            >
              {title}
            </Typography.Title>
            <Typography.Text style={{ color: '#8c8c8c', fontSize: 13 }}>
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
            style={{ width: 90 }} // Slightly reduced width for dropdown
            size="small" // Smaller dropdown to match screenshot context
            // ConfigProvider should be used for global dark theme for dropdown panels
          />
        </Col>
      </Row>
      <Column {...columnConfig} />
    </Card>
  );
};

export default AreaInstalledBarChartCard;

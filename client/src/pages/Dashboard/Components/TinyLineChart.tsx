import React from 'react';
import { Card, Typography, Statistic, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// import { TinyLine, TinyLineConfig } from '@ant-design/plots'; // Still commented out

interface TinyLineChartProps {
  title: string;
  value: string;
  trendValue: string; // e.g., "+2.6"
  trendDirection: 'up' | 'down';
  icon: React.ReactNode;
  chartData?: number[]; // Simple array of numbers for tiny line - Optional for now
  gradientColors: [string, string]; // [startColor, endColor] for background
  lineColor?: string; // Color for the tiny line chart - Optional for now
  cardStyle?: React.CSSProperties;
}

const TinyLineChart: React.FC<TinyLineChartProps> = ({
  title,
  value,
  trendValue,
  trendDirection,
  icon,
  // chartData,
  gradientColors,
  // lineColor,
  cardStyle,
}) => {
  const trendIcon =
    trendDirection === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor =
    trendDirection === 'up' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)';

  // const tinyLineConfig: TinyLineConfig = {
  //   data: chartData || [],
  //   height: 40,
  //   smooth: true,
  //   autoFit: true,
  //   color: lineColor || 'white',
  //   tooltip: false, // Usually not needed for tiny charts
  // };

  return (
    <Card
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        borderRadius: '16px',
        color: 'white',
        minWidth: '240px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Consistent shadow
        ...cardStyle,
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {' '}
        {/* Adjusted vertical spacing */}
        <Space align="center" size={8}>
          {React.cloneElement(icon as React.ReactElement, {
            style: { fontSize: '18px', color: 'rgba(255,255,255,0.75)' }, // Slightly adjusted icon
          })}
          <Typography.Text
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }} // Adjusted title
          >
            {title}
          </Typography.Text>
        </Space>
        <Typography.Title
          level={3}
          style={{
            color: '#ffffff',
            margin: 0,
            fontSize: '28px',
            fontWeight: '600',
          }} // Adjusted value
        >
          {value}
        </Typography.Title>
        <Space
          style={{ width: '100%', justifyContent: 'space-between' }}
          align="end"
        >
          <Statistic
            value={parseFloat(trendValue)} // Ensure number for precision
            valueStyle={{
              color: trendColor,
              fontSize: '13px', // Adjusted trend text
              fontWeight: 400,
            }}
            prefix={trendIcon}
            suffix="%"
          />
          {/* Placeholder for TinyLine, if it were active */}
          <div style={{ width: '70px', height: '30px' }}>
            {/* <TinyLine {...tinyLineConfig} /> */}
          </div>
        </Space>
      </Space>
    </Card>
  );
};

export default TinyLineChart;

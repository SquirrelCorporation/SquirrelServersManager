import React from 'react';
import { Card, Typography, Space, Progress } from 'antd';

interface CircularProgressChartProps {
  percentage: number; // 0 to 100
  value: string;
  label: string;
  color: string; // e.g., '#52c41a' for green
  cardStyle?: React.CSSProperties;
}

const CircularProgressChart: React.FC<CircularProgressChartProps> = ({
  percentage,
  value,
  label,
  color,
  cardStyle,
}) => {
  return (
    <Card
      style={{
        backgroundColor: '#4a8b6f',
        borderRadius: '16px',
        color: 'white',
        minWidth: '280px',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '24px 28px' }}
    >
      {/* Background decorative circles */}
      <div style={{
        position: 'absolute',
        right: -30,
        top: -30,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
      }} />
      <div style={{
        position: 'absolute',
        right: 40,
        bottom: -40,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
      }} />
      
      <Space direction="horizontal" align="center" size={20} style={{ position: 'relative' }}>
        <Progress
          type="circle"
          percent={percentage}
          width={90}
          strokeWidth={10}
          format={() => (
            <Typography.Text
              style={{ color: '#ffffff', fontSize: '20px', fontWeight: '600' }}
            >
              {Math.round(percentage)}%
            </Typography.Text>
          )}
          strokeColor="#6dd89e"
          trailColor="rgba(255, 255, 255, 0.2)"
          strokeLinecap="round"
        />
        <Space direction="vertical" align="start" size={4}>
          <Typography.Title
            level={3}
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '32px',
              fontWeight: '600',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography.Title>
          <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
            {label}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};

export default CircularProgressChart;

import React from 'react';
import { Card, Typography, Space, Progress } from 'antd';

interface MiniDonutStatCardProps {
  percentage: number; // 0 to 100
  value: string;
  label: string;
  color: string; // e.g., '#52c41a' for green
  cardStyle?: React.CSSProperties;
}

const MiniDonutStatCard: React.FC<MiniDonutStatCardProps> = ({
  percentage,
  value,
  label,
  color,
  cardStyle,
}) => {
  return (
    <Card
      style={{
        backgroundColor: '#222225',
        borderRadius: '16px',
        color: 'white',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Space direction="horizontal" align="center" size={12}>
        <Progress
          type="circle"
          percent={percentage}
          width={70}
          strokeWidth={8}
          format={() => (
            <Typography.Text
              style={{ color: '#f0f0f0', fontSize: '16px', fontWeight: '600' }}
            >
              {percentage}%
            </Typography.Text>
          )}
          strokeColor={color}
          trailColor="#3a3a3e"
          strokeLinecap="round"
        />
        <Space direction="vertical" align="start" size={0}>
          <Typography.Title
            level={5}
            style={{
              color: '#f0f0f0',
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            {value}
          </Typography.Title>
          <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
            {label}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};

export default MiniDonutStatCard;

import React from 'react';
import { Card, Typography, Statistic, Space } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BarChartOutlined,
} from '@ant-design/icons'; // BarChartOutlined for the small bar visual

interface CompactStatCardProps {
  title: string;
  value: string;
  trendValue: string; // e.g., "+2.6" or "2.6" (parsed to float)
  trendDirection: 'up' | 'down';
  trendDescription: string; // e.g., "last 7 days"
  trendColor: string; // e.g., '#52c41a' for green
  cardStyle?: React.CSSProperties;
}

const CompactStatCard: React.FC<CompactStatCardProps> = ({
  title,
  value,
  trendValue,
  trendDirection,
  trendDescription,
  trendColor,
  cardStyle,
}) => {
  const trendIcon =
    trendDirection === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  return (
    <Card
      style={{
        backgroundColor: '#1a1a1a', // Consistent with other dashboard components
        borderRadius: '16px',
        color: 'white',
        minWidth: '260px', // Adjusted min width
        border: 'none',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '20px 24px' }} // Standardized padding
    >
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        {' '}
        {/* Adjusted spacing */}
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
          {title}
        </Typography.Text>
        <Space
          align="center" // Align icon and value better
          style={{ justifyContent: 'space-between', width: '100%' }}
          size={12}
        >
          <Typography.Title
            level={2} // Consistent level with SummaryStatCard for main value
            style={{
              color: '#f0f0f0',
              margin: 0,
              fontSize: '30px',
              fontWeight: '600',
            }}
          >
            {value}
          </Typography.Title>
          <BarChartOutlined
            style={{ fontSize: '32px', color: trendColor, opacity: 0.8 }} // Adjusted size and opacity
          />
        </Space>
        <Space align="center" size={4}>
          <Statistic
            value={parseFloat(trendValue)} // Ensure number for precision
            precision={1}
            valueStyle={{
              color: trendColor,
              fontSize: '13px',
              fontWeight: 500,
            }}
            prefix={trendIcon}
            suffix="%"
          />
          <Typography.Text
            style={{ color: '#8c8c8c', fontSize: '13px', marginLeft: '4px' }}
          >
            {trendDescription}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
};

export default CompactStatCard;

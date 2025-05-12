import React from 'react';
import { Card, Typography, Statistic, Space, Avatar } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// Assuming you have antd icons for specific items, or use generic ones
// import { BookOutlined, ShoppingCartOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface SummaryStatCardProps {
  title: string;
  value: string;
  trendValue: string;
  trendDirection: 'up' | 'down';
  icon: React.ReactNode; // e.g., <BookOutlined />
  illustrationUrl?: string; // URL for the small image/illustration
  cardStyle?: React.CSSProperties;
}

const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
  title,
  value,
  trendValue,
  trendDirection,
  icon,
  illustrationUrl,
  cardStyle,
}) => {
  const trendIcon =
    trendDirection === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor = trendDirection === 'up' ? '#52c41a' : '#ff4d4f'; // Adjusted trend colors for better visibility on dark bg

  return (
    <Card
      style={{
        backgroundColor: '#222225', // Slightly adjusted dark card background from screenshots
        borderRadius: '16px',
        color: 'white',
        minWidth: '280px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Subtle shadow
        ...cardStyle,
      }}
      bodyStyle={{ padding: '20px 24px' }} // Standardized padding
    >
      <Space
        direction="horizontal"
        align="start"
        style={{ width: '100%', justifyContent: 'space-between' }}
        size={16} // Increased spacing between text block and illustration
      >
        <Space direction="vertical" size={4}>
          {' '}
          {/* Reduced vertical spacing slightly */}
          <Space align="center" size={8}>
            {React.cloneElement(icon as React.ReactElement, {
              style: { fontSize: '22px', color: '#8c8c8c' }, // Slightly adjusted icon color and size
            })}
            <Typography.Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
              {' '}
              {/* Adjusted title font size and color */}
              {title}
            </Typography.Text>
          </Space>
          <Typography.Title
            level={2}
            style={{
              color: '#f0f0f0',
              margin: 0,
              fontSize: '32px',
              fontWeight: '600',
            }} // Adjusted value style
          >
            {value}
          </Typography.Title>
          <Statistic
            value={parseFloat(trendValue)} // Ensure value is a number for precision
            precision={1}
            valueStyle={{
              color: trendColor,
              fontSize: '13px',
              fontWeight: 500,
            }} // Adjusted trend font size and weight
            prefix={trendIcon}
            suffix="%"
          />
        </Space>
        {illustrationUrl && (
          <Avatar
            src={illustrationUrl}
            shape="square"
            size={60} // Slightly adjusted illustration size
            style={{ borderRadius: '8px' }}
          />
        )}
      </Space>
    </Card>
  );
};

export default SummaryStatCard;

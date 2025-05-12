import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';

interface FeaturedAppCardProps {
  tagText: string;
  title: string;
  description: string;
  imageUrl: string; // For the top banner image
  cardStyle?: React.CSSProperties;
}

const FeaturedAppCard: React.FC<FeaturedAppCardProps> = ({
  tagText,
  title,
  description,
  imageUrl,
  cardStyle,
}) => {
  return (
    <Card
      style={{
        backgroundColor: '#222225',
        borderRadius: '16px',
        color: 'white',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        ...cardStyle,
      }}
      bodyStyle={{ padding: '16px 20px 20px 20px' }}
      cover={
        <img
          alt={title}
          src={imageUrl}
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
          }}
        />
      }
    >
      <Space direction="vertical" size={8}>
        <Tag
          style={{
            backgroundColor: 'rgba(82, 196, 26, 0.1)',
            borderColor: 'rgba(82, 196, 26, 0.3)',
            color: '#52c41a',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 500,
          }}
        >
          {tagText.toUpperCase()}
        </Tag>
        <Typography.Title
          level={5}
          style={{
            color: '#f0f0f0',
            margin: 0,
            fontWeight: 500,
            fontSize: '15px',
          }}
          ellipsis={{ rows: 1 }}
        >
          {title}
        </Typography.Title>
        <Typography.Paragraph
          style={{ color: '#8c8c8c', fontSize: '13px', lineHeight: '1.5' }}
          ellipsis={{ rows: 2 }}
        >
          {description}
        </Typography.Paragraph>
      </Space>
    </Card>
  );
};

export default FeaturedAppCard;

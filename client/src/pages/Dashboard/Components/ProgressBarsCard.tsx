import React from 'react';
import { Card, Typography, Progress, Space, Row, Col } from 'antd';

interface StatusItem {
  name: string;
  count: string;
  percentage: number; // For progress bar
  color: string;
}

interface ProgressBarsCardProps {
  title: string;
  statuses?: StatusItem[];
  cardStyle?: React.CSSProperties;
}

const ProgressBarsCard: React.FC<ProgressBarsCardProps> = ({
  title,
  statuses = [],
  cardStyle,
}) => {
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
      <Typography.Title
        level={4}
        style={{ 
          color: '#ffffff', 
          margin: '0 0 32px 0', 
          fontSize: '20px',
          fontWeight: 600 
        }}
      >
        {title}
      </Typography.Title>
      
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {statuses.map((status) => (
          <div key={status.name} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
              <Col>
                <Typography.Text style={{ 
                  color: '#d9d9d9', 
                  fontSize: '16px',
                  fontWeight: 400
                }}>
                  {status.name}
                </Typography.Text>
              </Col>
              <Col>
                <Space size={8} align="center">
                  <Typography.Text
                    style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '600',
                    }}
                  >
                    {status.count}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      color: '#8c8c8c',
                      fontSize: '14px',
                    }}
                  >
                    ({status.percentage}%)
                  </Typography.Text>
                </Space>
              </Col>
            </Row>
            <div style={{ position: 'relative' }}>
              <Progress
                percent={status.percentage}
                showInfo={false}
                strokeColor={status.color}
                trailColor="rgba(255, 255, 255, 0.08)"
                strokeWidth={8}
                style={{ margin: 0 }}
              />
            </div>
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default ProgressBarsCard;

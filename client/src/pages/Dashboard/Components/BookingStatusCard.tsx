import React from 'react';
import { Card, Typography, Progress, Space, Row, Col } from 'antd';

interface StatusItem {
  name: string;
  count: string;
  percentage: number; // For progress bar
  color: string;
}

interface BookingStatusCardProps {
  title: string;
  statuses: StatusItem[];
  cardStyle?: React.CSSProperties;
}

const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
  title,
  statuses,
  cardStyle,
}) => {
  return (
    <Card
      title={
        <Typography.Title
          level={4}
          style={{ color: '#f0f0f0', margin: 0, fontWeight: 500 }}
        >
          {title}
        </Typography.Title>
      }
      style={{
        backgroundColor: '#222225',
        borderRadius: '16px',
        color: 'white',
        ...cardStyle,
      }}
      headStyle={{
        borderBottom: 0,
        paddingTop: '20px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '8px',
      }}
      bodyStyle={{ padding: '0px 24px 24px 24px' }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {statuses.map((status) => (
          <div key={status.name} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Typography.Text style={{ color: '#d9d9d9', fontSize: '13px' }}>
                  {status.name}
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Text
                  style={{
                    color: '#f0f0f0',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {status.count}
                </Typography.Text>
              </Col>
            </Row>
            <Progress
              percent={status.percentage}
              showInfo={false}
              strokeColor={status.color}
              trailColor="#3a3a3e"
              size="small"
              style={{ margin: '6px 0 0 0' }}
            />
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default BookingStatusCard;

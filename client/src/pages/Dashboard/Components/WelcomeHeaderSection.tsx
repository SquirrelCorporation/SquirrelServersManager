import React from 'react';
import { Typography, Button, Space, Image, Row, Col } from 'antd';

interface WelcomeHeaderSectionProps {
  userName: string;
  greeting?: string; // e.g. "Welcome back"
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
  illustrationUrl: string;
  style?: React.CSSProperties;
}

const WelcomeHeaderSection: React.FC<WelcomeHeaderSectionProps> = ({
  userName,
  greeting = 'Welcome back',
  subtitle,
  buttonText,
  onButtonClick,
  illustrationUrl,
  style,
}) => {
  return (
    <Row
      align="middle"
      justify="space-between"
      style={{
        backgroundColor: '#222225', // Consistent dark background
        padding: '32px 40px', // Adjusted padding
        borderRadius: '16px',
        color: 'white',
        ...style,
      }}
    >
      <Col xs={24} md={15} lg={14}>
        {' '}
        {/* Adjusted column span for text */}
        <Space direction="vertical" size={18}>
          {' '}
          {/* Adjusted spacing */}
          <Typography.Title
            level={2}
            style={{
              color: '#f5f5f5',
              margin: 0,
              fontWeight: 400,
              lineHeight: '1.3',
            }}
          >
            {greeting} <span style={{ fontWeight: 'bold' }}>{userName}</span> 👋
          </Typography.Title>
          <Typography.Text
            style={{ color: '#a6a6a6', fontSize: '15px', lineHeight: '1.6' }}
          >
            {subtitle}
          </Typography.Text>
          <Button
            type="primary"
            size="large"
            onClick={onButtonClick}
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              borderRadius: '8px',
              padding: '0 32px',
              height: '46px',
              fontSize: '15px',
              fontWeight: 500,
              marginTop: '8px', // Added some margin to the button
            }}
          >
            {buttonText}
          </Button>
        </Space>
      </Col>
      <Col
        xs={24}
        md={9}
        lg={10}
        style={{ textAlign: 'center', marginTop: '20px' }}
      >
        {/* The illustration in the screenshot is quite specific.
             Using a placeholder or ensuring the provided URL is suitable. */}
        <Image
          src={illustrationUrl}
          alt="Welcome Illustration"
          preview={false}
          style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
        />
      </Col>
    </Row>
  );
};

export default WelcomeHeaderSection;

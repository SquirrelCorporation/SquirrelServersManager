import React from 'react';
import { Typography } from 'antd';

interface WelcomeHeaderSectionProps {
  userName: string;
  greeting?: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
  illustrationUrl: string;
  style?: React.CSSProperties;
}

const WelcomeHeaderSection: React.FC<WelcomeHeaderSectionProps> = ({
  userName,
  greeting = 'Congratulations',
  subtitle,
  buttonText,
  onButtonClick,
  illustrationUrl,
  style,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1a2938 0%, #2a3f5f 50%, #1e3451 100%)',
        padding: '32px 40px',
        borderRadius: '16px',
        color: 'white',
        overflow: 'hidden',
        minHeight: '200px',
        ...style,
      }}
    >
      {/* Background decoration bars */}
      <div
        style={{
          position: 'absolute',
          right: '180px',
          bottom: '0',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ 
          width: '36px', 
          height: '100px', 
          backgroundColor: 'rgba(126, 211, 170, 0.3)', 
          borderRadius: '6px 6px 0 0' 
        }} />
        <div style={{ 
          width: '36px', 
          height: '70px', 
          backgroundColor: 'rgba(126, 211, 170, 0.4)', 
          borderRadius: '6px 6px 0 0' 
        }} />
        <div style={{ 
          width: '36px', 
          height: '85px', 
          backgroundColor: 'rgba(126, 211, 170, 0.35)', 
          borderRadius: '6px 6px 0 0' 
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '50%' }}>
        <Typography.Title
          level={2}
          style={{
            color: '#ffffff',
            margin: 0,
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '1.2',
          }}
        >
          {greeting} 🎉
        </Typography.Title>
        
        <Typography.Title
          level={2}
          style={{
            color: '#ffffff',
            margin: '2px 0 12px 0',
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '1.2',
          }}
        >
          {userName}
        </Typography.Title>

        <Typography.Text
          style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '14px', 
            lineHeight: '1.5',
            display: 'block',
            marginBottom: '20px',
            maxWidth: '85%',
          }}
        >
          {subtitle}
        </Typography.Text>

        <button
          onClick={onButtonClick}
          style={{
            backgroundColor: '#4ecb71',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 28px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {buttonText}
        </button>
      </div>

      {/* Character illustration */}
      <img
        src={illustrationUrl}
        alt="Welcome Illustration"
        style={{
          position: 'absolute',
          right: '20px',
          bottom: '0',
          height: '180px',
          objectFit: 'contain',
          zIndex: 3,
        }}
      />
    </div>
  );
};

export default WelcomeHeaderSection;

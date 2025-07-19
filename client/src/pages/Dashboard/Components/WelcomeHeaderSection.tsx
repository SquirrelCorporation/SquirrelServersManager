import React, { useMemo } from 'react';
import { Typography } from 'antd';
import { useModel } from '@umijs/max';
import DebugOverlay from './DebugOverlay';

interface WelcomeHeaderSectionProps {
  userName?: string;
  greeting?: string;
  subtitle?: string;
  buttonText: string;
  onButtonClick: () => void;
  illustrationUrl: string;
  style?: React.CSSProperties;
}

const WelcomeHeaderSection: React.FC<WelcomeHeaderSectionProps> = ({
  userName: propUserName,
  greeting = 'Welcome',
  subtitle: propSubtitle,
  buttonText,
  onButtonClick,
  illustrationUrl,
  style,
}) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  // Get user name from the model, fallback to prop
  const userName = useMemo(() => currentUser?.name || propUserName || 'User', [currentUser?.name, propUserName]);

  // Squirrel-themed quotes about SSM
  const squirrelQuotes = useMemo(() => [
    "Going nuts over server management? We've got you covered! 🥜",
    "No more squirreling away from complex server tasks - SSM makes it simple! 🐿️",
    "Storing your server configurations safely in our digital tree! 🌳",
    "Busy as a squirrel? Let SSM handle your servers while you focus on what matters! ⚡",
    "From acorn-sized servers to mighty oak infrastructures - we scale with you! 🌰➡️🌳",
    "Don't let server management drive you nuts - SSM is here to help! 🔧",
    "Hoarding server resources efficiently, one container at a time! 📦",
    "Winter-proof your infrastructure with SSM's reliable management! ❄️",
    "Cracking the code on server management - no more nutty configurations! 💻",
    "Scurrying through your to-do list? Let SSM automate your servers! 🏃‍♂️",
    "Building a nest egg of perfectly managed servers! 🏠",
    "Going out on a limb to make server management fun and easy! 🌿",
    "SSM: Because life's too short for manual server management! ⏰"
  ], []);

  // Get random quote
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * squirrelQuotes.length);
    return squirrelQuotes[randomIndex];
  }, [squirrelQuotes]);

  const subtitle = propSubtitle || randomQuote;
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
            margin: '0 0 16px 0',
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '1.2',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {greeting} {userName}
          <span style={{ fontSize: '24px' }}>🎉</span>
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
      <DebugOverlay fileName="WelcomeHeaderSection.tsx" componentName="WelcomeHeaderSection" />
    </div>
  );
};

export default WelcomeHeaderSection;

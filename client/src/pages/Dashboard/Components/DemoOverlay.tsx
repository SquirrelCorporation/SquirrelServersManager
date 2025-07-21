import React from 'react';
import { Typography } from 'antd';

interface DemoOverlayProps {
  show: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium';
}

const DemoOverlay: React.FC<DemoOverlayProps> = ({ 
  show, 
  position = 'bottom-right',
  size = 'small'
}) => {
  if (!show) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 10,
      backgroundColor: 'rgba(255, 152, 0, 0.9)',
      color: '#fff',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: size === 'small' ? '10px' : '12px',
      padding: size === 'small' ? '2px 6px' : '4px 8px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: '8px', right: '8px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '8px', left: '8px' };
      case 'top-right':
        return { ...baseStyles, top: '8px', right: '8px' };
      case 'top-left':
        return { ...baseStyles, top: '8px', left: '8px' };
      default:
        return { ...baseStyles, bottom: '8px', right: '8px' };
    }
  };

  return (
    <div style={getPositionStyles()}>
      DEMO
    </div>
  );
};

export default DemoOverlay;
import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';

export interface ModalProps extends AntModalProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({ 
  size = 'medium',
  width,
  style,
  ...props 
}) => {
  const sizeMap = {
    small: 416,
    medium: 520,
    large: 720,
    fullscreen: '100vw'
  };

  const mergedWidth = width || sizeMap[size];
  const mergedStyle = size === 'fullscreen' 
    ? { 
        ...style,
        top: 0,
        padding: 0,
        maxWidth: '100vw'
      }
    : style;

  return (
    <AntModal 
      width={mergedWidth}
      style={mergedStyle}
      centered={size !== 'fullscreen'}
      {...props} 
    />
  );
};

// Export Modal static methods
export const { info, success, error, warning, confirm } = Modal;
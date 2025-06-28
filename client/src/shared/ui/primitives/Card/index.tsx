import React from 'react';
import { Card as AntCard, CardProps as AntCardProps } from 'antd';

export interface CardProps extends AntCardProps {
  variant?: 'default' | 'bordered' | 'hoverable';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ 
  variant = 'default',
  padding = 'medium',
  bordered,
  hoverable,
  bodyStyle,
  ...props 
}) => {
  const paddingMap = {
    none: 0,
    small: 12,
    medium: 24,
    large: 32
  };

  const mergedBodyStyle = {
    padding: paddingMap[padding],
    ...bodyStyle
  };

  return (
    <AntCard 
      bordered={variant === 'bordered' || bordered}
      hoverable={variant === 'hoverable' || hoverable}
      bodyStyle={mergedBodyStyle}
      {...props} 
    />
  );
};
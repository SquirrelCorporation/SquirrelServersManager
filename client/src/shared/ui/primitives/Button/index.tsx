import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntButtonProps, 'type'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  className,
  ...props 
}) => {
  const type = variant === 'primary' ? 'primary' : 'default';
  const antSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'middle';
  
  const variantClasses = {
    primary: '',
    secondary: '',
    danger: 'ant-btn-dangerous',
    ghost: 'ant-btn-ghost'
  };

  const combinedClassName = [
    className,
    variantClasses[variant]
  ].filter(Boolean).join(' ');

  return (
    <AntButton 
      type={type}
      size={antSize}
      danger={variant === 'danger'}
      ghost={variant === 'ghost'}
      className={combinedClassName}
      {...props} 
    />
  );
};
import React from 'react';
import { Input as AntInput, InputProps as AntInputProps } from 'antd';

export interface InputProps extends AntInputProps {
  variant?: 'default' | 'filled' | 'borderless';
}

export const Input: React.FC<InputProps> = ({ 
  variant = 'default',
  ...props 
}) => {
  const variantProps = {
    default: {},
    filled: { variant: 'filled' as const },
    borderless: { variant: 'borderless' as const }
  };

  return <AntInput {...variantProps[variant]} {...props} />;
};

// Export related components
export const { TextArea, Search, Password, Group } = AntInput;
export type { TextAreaProps, SearchProps, PasswordProps, GroupProps } from 'antd/lib/input';
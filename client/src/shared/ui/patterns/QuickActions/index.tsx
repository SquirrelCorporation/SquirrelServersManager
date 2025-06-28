import React from 'react';
import { Dropdown, Space, MenuProps, message } from 'antd';
import { MoreOutlined, DownOutlined } from '@ant-design/icons';
import { Button } from '@shared/ui/primitives';

export interface QuickAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onClick: () => void | Promise<void>;
  divider?: boolean;
  children?: QuickAction[];
}

export interface QuickActionsProps {
  actions: QuickAction[];
  loading?: boolean;
  buttonProps?: {
    icon?: React.ReactNode;
    text?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'small' | 'medium' | 'large';
  };
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  placement?: MenuProps['placement'];
  onError?: (error: Error) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  loading = false,
  buttonProps = {},
  trigger = ['click'],
  placement,
  onError = (error) => message.error(error.message || 'Action failed')
}) => {
  const visibleActions = actions.filter(action => !action.hidden);
  
  const handleClick = async (action: QuickAction) => {
    try {
      await action.onClick();
    } catch (error) {
      onError(error as Error);
    }
  };
  
  const mapActionsToMenuItems = (actions: QuickAction[]): MenuProps['items'] => {
    return actions.map(action => {
      if (action.divider) {
        return { type: 'divider', key: action.key };
      }
      
      return {
        key: action.key,
        label: action.label,
        icon: action.icon,
        danger: action.danger,
        disabled: action.disabled || loading,
        onClick: () => handleClick(action),
        children: action.children ? mapActionsToMenuItems(action.children) : undefined
      };
    });
  };

  const menuItems = mapActionsToMenuItems(visibleActions);
  
  const { icon = <MoreOutlined />, text, variant = 'ghost', size = 'medium' } = buttonProps;

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={trigger}
      placement={placement}
      disabled={loading || visibleActions.length === 0}
    >
      <Button
        variant={variant}
        size={size}
        loading={loading}
        icon={icon}
      >
        {text && (
          <Space>
            {text}
            <DownOutlined />
          </Space>
        )}
      </Button>
    </Dropdown>
  );
};
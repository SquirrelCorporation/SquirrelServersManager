import MenuElementIcons from '@/components/ComposeEditor/Menu/MenuElementIcons';
import { Avatar } from 'antd';
import React from 'react';

export const renderLabelWithIcon = (label: string, id: string) => {
  const element = MenuElementIcons[id];
  if (element) {
    const { icon, color } = element;
    return (
      <span style={{ marginBottom: 5 }}>
        <Avatar
          size={'small'}
          // @ts-ignore
          src={React.cloneElement(icon, {
            style: { fontSize: '16px', color: 'whitesmoke' },
          })}
          style={{ backgroundColor: color, marginRight: 5 }}
        />
        {label}
      </span>
    );
  } else {
    return label;
  }
};

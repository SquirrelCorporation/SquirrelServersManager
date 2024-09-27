import {
  Apache,
  Attach,
  CommandLine,
  Config,
  Crown,
  DnsOutline,
  EntranceAlt1,
  ExternalLink,
  ExternalTFVC,
  File,
  HealthRecognition,
  Internal,
  Link,
  Open,
  Restart,
  ServerEnvironment,
  Test,
  Title,
  UserSecret,
  Validate,
} from '@/components/Icons/CustomIcons';
import { ProList } from '@ant-design/pro-components';
import { Avatar, ColorPicker, List, Popover } from 'antd';
import { AvatarSize } from 'antd/es/avatar/AvatarContext';
import React, { useState } from 'react';

const icons = [
  {
    icon: <Validate />,
    id: 'validate',
  },
  {
    icon: <Test />,
    id: 'test',
  },
  {
    icon: <Internal />,
    id: 'internal',
  },
  {
    icon: <Attach />,
    id: 'attach',
  },
  {
    icon: <ExternalLink />,
    id: 'externallink',
  },
  {
    icon: <Apache />,
    id: 'apache',
  },
  {
    icon: <UserSecret />,
    id: 'secret',
  },
  {
    icon: <Restart />,
    id: 'restart',
  },
  {
    icon: <Crown />,
    id: 'crown',
  },
  {
    icon: <HealthRecognition />,
    id: 'health',
  },
  {
    icon: <ExternalTFVC />,
    id: 'externalTFVC',
  },
  {
    icon: <Open />,
    id: 'open',
  },
  {
    icon: <File />,
    id: 'file',
  },
  {
    icon: <ServerEnvironment />,
    id: 'serverEnvironment',
  },
  {
    icon: <EntranceAlt1 />,
    id: 'entranceAlt1',
  },
  {
    icon: <DnsOutline />,
    id: 'dns',
  },
  {
    icon: <Link />,
    id: 'link',
  },
  {
    icon: <Title />,
    id: 'title',
  },
  {
    icon: <CommandLine />,
    id: 'commandline',
  },
  {
    icon: <Config />,
    id: 'config',
  },
];

type IconGridProps = {
  setStackIcon: any;
  stackIcon: {
    icon: string;
    iconColor: string;
    iconBackgroundColor: string;
  };
};

export const StackIcon = ({
  stackIcon,
  size = 'small',
}: {
  stackIcon: {
    icon: string;
    iconColor: string;
    iconBackgroundColor: string;
  };
  size?: AvatarSize;
}) => {
  const icon = icons.find((e) => e.id === stackIcon.icon)?.icon;
  if (icon) {
    return (
      <Avatar
        size={size}
        src={React.cloneElement(icon, {
          style: {
            fontSize: size === 'small' ? '14px' : '20px',
            color: stackIcon.iconColor,
          },
        })}
        style={{
          backgroundColor: stackIcon.iconBackgroundColor,
          cursor: 'pointer',
        }}
      />
    );
  }
};

const IconGrid: React.FC<IconGridProps> = ({ stackIcon, setStackIcon }) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  return (
    <ProList
      style={{ maxWidth: 200 }}
      toolBarRender={() => [
        <ColorPicker
          key={'icon-color'}
          defaultValue={stackIcon.iconColor}
          onChange={(value) =>
            setStackIcon({ ...stackIcon, iconColor: value.toHexString() })
          }
          showText={() => <span>Icon</span>}
        />,
        <ColorPicker
          key={'background-color'}
          onChange={(value) => {
            setStackIcon({
              ...stackIcon,
              iconBackgroundColor: value.toHexString(),
            });
          }}
          defaultValue={stackIcon.iconBackgroundColor}
          showText={() => <span>Background</span>}
        />,
      ]}
      ghost
      scroll={{ x: 20 }}
      dataSource={icons}
      itemLayout={'horizontal'}
      size={'small'}
      grid={{
        gutter: 0,
        xs: 1,
        sm: 2,
        md: 4,
        lg: 4,
        xl: 6,
      }}
      renderItem={({ icon, id }) => (
        <List.Item
          style={{ padding: 0, marginBlock: 1 }}
          onMouseEnter={() => setHoveredItemId(id)}
          onMouseLeave={() => setHoveredItemId(null)}
          onClick={() => {
            setStackIcon({ ...stackIcon, icon: id });
          }}
        >
          <Avatar
            src={React.cloneElement(icon, {
              style: { fontSize: '24px', color: stackIcon.iconColor },
            })}
            size={'large'}
            style={{
              backgroundColor:
                hoveredItemId === id
                  ? 'transparent'
                  : stackIcon.iconBackgroundColor,
              transition: 'background-color 0.3s',
              cursor: 'pointer',
            }}
          />
        </List.Item>
      )}
    />
  );
};

type StackIconSelectorProps = {
  children: React.ReactNode;
  setStackIcon: any;
  stackIcon: {
    icon: string;
    iconColor: string;
    iconBackgroundColor: string;
  };
};

export const StackIconSelector: React.FC<StackIconSelectorProps> = ({
  children,
  setStackIcon,
  stackIcon,
}) => (
  <Popover
    content={<IconGrid setStackIcon={setStackIcon} stackIcon={stackIcon} />}
    placement={'bottom'}
  >
    {children}
  </Popover>
);

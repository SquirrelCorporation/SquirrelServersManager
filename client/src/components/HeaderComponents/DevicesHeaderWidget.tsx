import HeaderDropdown from '@/components/HeaderComponents/HeaderDropDown';
import { ElNetwork } from '@/components/Icons/CustomIcons';
import Devicestatus from '@/utils/devicestatus';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel } from '@umijs/max';
import {
  Avatar,
  Badge,
  DropdownProps,
  MenuProps,
  Spin,
  Typography,
} from 'antd';
import React, { useState, useMemo, useCallback } from 'react';

export const DevicesHeaderWidget: React.FC = React.memo(() => {
  const [open, setOpen] = useState(false);

  const actionClassName = useEmotionCss(({ token }) => ({
    display: 'flex',
    height: '48px',
    marginLeft: 'auto',
    overflow: 'hidden',
    alignItems: 'center',
    padding: '0 8px',
    cursor: 'pointer',
    borderRadius: token.borderRadius,
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  }));

  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  const loading = useMemo(
    () => (
      <span className={actionClassName}>
        <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
      </span>
    ),
    [actionClassName],
  );

  const handleOpenChange: DropdownProps['onOpenChange'] = useCallback(
    (nextOpen: boolean, info: { source: 'menu' | 'trigger' }) => {
      if (info.source === 'trigger' || nextOpen) {
        setOpen(nextOpen);
      }
    },
    [],
  );

  const items = useMemo<MenuProps['items']>(() => {
    return (
      currentUser?.devices?.overview?.map(
        (device: { name?: string; status?: number }, index: number) => ({
          key: `${index}`,
          label: (
            <Badge
              status={
                device.status === Devicestatus.ONLINE
                  ? 'success'
                  : device.status === Devicestatus.UNMANAGED
                    ? 'processing'
                    : device.status === Devicestatus.REGISTERING
                      ? 'warning'
                      : 'error'
              }
              text={
                <Typography.Text
                  style={{ width: 200 }}
                  ellipsis={{ tooltip: device.name }}
                >
                  {device.name || <i>Unknown device</i>}
                </Typography.Text>
              }
            />
          ),
        }),
      ) || []
    );
  }, [currentUser?.devices?.overview]);

  if (!initialState || !currentUser || !currentUser.devices) {
    return loading;
  }

  return (
    <HeaderDropdown
      menu={{ items }}
      onOpenChange={handleOpenChange}
      open={open}
    >
      <Badge
        count={currentUser.devices.offline}
        className="site-badge-count-109"
        offset={[0, 10]}
      >
        <Avatar
          src={
            <ElNetwork
              className="svg-small-anim-rotate"
              style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '20px' }}
            />
          }
        />
      </Badge>
    </HeaderDropdown>
  );
});

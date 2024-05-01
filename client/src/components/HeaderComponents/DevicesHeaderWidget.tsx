import HeaderDropdown from '@/components/HeaderComponents/HeaderDropDown';
import { ElNetwork } from '@/components/Icons/CustomIcons';
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
import React from 'react';
import Devicestatus from '@/utils/devicestatus';

export const DevicesHeaderWidget: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const actionClassName = useEmotionCss(({ token }) => {
    return {
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
    };
  });

  const { initialState } = useModel('@@initialState');

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );
  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.devices) {
    return loading;
  }

  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setOpen(nextOpen);
    }
  };

  const items: MenuProps['items'] =
    currentUser?.devices?.overview?.map(
      (e: { name?: string; status?: number }, index: number) => {
        return {
          key: `${index}`,
          label: (
            <Badge
              status={
                e.status === Devicestatus.ONLINE
                  ? 'success'
                  : e.status === Devicestatus.UNMANAGED
                    ? 'processing'
                    : e.status === Devicestatus.REGISTERING
                      ? 'warning'
                      : 'error'
              }
              text={
                <Typography.Text
                  style={{ width: 200 }}
                  ellipsis={{ tooltip: e.name }}
                >
                  {e.name || <i>Unknown device</i>}
                </Typography.Text>
              }
            />
          ),
        };
      },
    ) || [];

  return (
    <>
      <HeaderDropdown
        menu={{
          items,
        }}
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
                className={'svg-small-anim-rotate'}
                style={{
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
                width={'20px'}
                height={'20px'}
                size={20}
              />
            }
          />
        </Badge>
      </HeaderDropdown>
    </>
  );
};

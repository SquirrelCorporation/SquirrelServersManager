import { FluentMdl2Health, UpdateLine } from '@/components/Icons/CustomIcons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel } from '@umijs/max';
import { Avatar, Badge, Popover, Spin, Typography } from 'antd';
import React, { useMemo } from 'react';
import { API } from 'ssm-shared-lib';

export const UpdateAvailableWidget: React.FC = React.memo(() => {
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
  const currentUser = initialState?.currentUser as API.CurrentUser;

  const loading = useMemo(
    () => (
      <span className={actionClassName}>
        <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
      </span>
    ),
    [actionClassName],
  );

  if (!initialState || !currentUser) {
    return loading;
  }

  if (
    !currentUser.settings?.updateAvailable ||
    currentUser.settings?.updateAvailable === ''
  ) {
    return;
  }

  return (
    <Popover
      content={
        <Typography.Link
          href="https://squirrelserversmanager.io/docs/quickstart#to-update-ssm-simply-run"
          target="_blank"
        >
          A new version is available: {currentUser.settings.updateAvailable}
        </Typography.Link>
      }
    >
      <Badge dot={true} offset={[0, 10]}>
        <Avatar
          src={
            <UpdateLine
              className="svg-small-anim-pulse"
              style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '20px' }}
            />
          }
        />
      </Badge>
    </Popover>
  );
});

export default UpdateAvailableWidget;

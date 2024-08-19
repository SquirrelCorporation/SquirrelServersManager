import { FluentMdl2Health } from '@/components/Icons/CustomIcons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel } from '@umijs/max';
import { Avatar, Badge, Popover, Spin } from 'antd';
import React, { useMemo } from 'react';

export const HealthWidget: React.FC = React.memo(() => {
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

  if (!initialState || !currentUser || !currentUser.devices) {
    return loading;
  }

  return (
    <Popover
      content={`System performance: ${currentUser.systemPerformance?.message}`}
    >
      <Badge dot={currentUser.systemPerformance?.danger} offset={[0, 10]}>
        <Avatar
          src={
            <FluentMdl2Health
              className="svg-small-anim-pulse"
              style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '20px' }}
            />
          }
        />
      </Badge>
    </Popover>
  );
});

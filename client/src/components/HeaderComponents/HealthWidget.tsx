import { FluentMdl2Health } from '@/components/Icons/CustomIcons';
import { getDashboardSystemPerformance } from '@/services/rest/stastistics';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Avatar, Badge, Popover, Spin } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';

export const HealthWidget: React.FC = React.memo(() => {
  const [systemPerformance, setSystemPerformance] =
    useState<API.SystemPerformance | null>(null);
  const [loading, setLoading] = useState(false);
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

  const loadingView = useMemo(
    () => (
      <span className={actionClassName}>
        <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
      </span>
    ),
    [actionClassName],
  );

  const fetchSystemPerformance = async () => {
    setLoading(true);
    const response = await getDashboardSystemPerformance();
    setSystemPerformance(response.data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchSystemPerformance();
  }, []);

  if (loading) {
    return loadingView;
  }
  return (
    <Popover content={`System performance: ${systemPerformance?.message}`}>
      <Badge dot={systemPerformance?.danger} offset={[0, 10]}>
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

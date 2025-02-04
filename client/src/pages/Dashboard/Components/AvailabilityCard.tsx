import styles from '@/pages/Dashboard/Analysis.less';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import MiniProgress from '@/pages/Dashboard/ChartComponents/MiniProgress';
import Trend from '@/pages/Dashboard/ChartComponents/Trend';
import { getDashboardAvailabilityStat } from '@/services/rest/devicestat';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { API } from 'ssm-shared-lib';

const AvailabilityCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [availabilityStat, setAvailabilityStat] = useState<
    API.AvailabilityStat | undefined
  >(undefined);

  const asyncFetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDashboardAvailabilityStat();
      setAvailabilityStat(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    asyncFetch();
  }, [asyncFetch]);

  const title = useMemo(
    () => <Typography.Title level={5}>System Availability</Typography.Title>,
    [],
  );

  const action = useMemo(
    () => (
      <Tooltip title="The percentage of uptime of your combined devices">
        <InfoCircleFilled style={{ color: 'white' }} />
      </Tooltip>
    ),
    [],
  );

  const total = useMemo(
    () =>
      `${availabilityStat ? (availabilityStat.availability < 1 ? (availabilityStat.availability * 100).toFixed(5) : 100) : 'NaN'}%`,
    [availabilityStat],
  );

  const footer = useMemo(
    () => (
      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Trend
          flag={
            availabilityStat &&
            availabilityStat.availability &&
            availabilityStat.lastMonth
              ? availabilityStat.availability >= availabilityStat.lastMonth
                ? availabilityStat.availability === availabilityStat.lastMonth
                  ? 'eq'
                  : 'up'
                : 'down'
              : undefined
          }
          style={{ marginRight: 16 }}
        >
          <Typography.Text>Last Month</Typography.Text>
          <span className={styles.trendText}>
            <Typography.Text>
              {availabilityStat
                ? availabilityStat.lastMonth < 1
                  ? (availabilityStat.lastMonth * 100).toFixed(5)
                  : 100
                : 'None'}
              %
            </Typography.Text>
          </span>
        </Trend>
      </div>
    ),
    [availabilityStat],
  );

  const percent = useMemo(
    () =>
      availabilityStat ? (availabilityStat.availability * 100).toFixed(0) : 0,
    [availabilityStat],
  );

  return (
    <ChartCard
      loading={loading}
      bordered={false}
      title={title}
      action={action}
      total={total}
      footer={footer}
      contentHeight={60}
    >
      <MiniProgress percent={percent as number} />
    </ChartCard>
  );
};

export default React.memo(AvailabilityCard);

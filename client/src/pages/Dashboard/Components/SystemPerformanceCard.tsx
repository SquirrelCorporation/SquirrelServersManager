import styles from '@/pages/Dashboard/Analysis.less';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import Trend from '@/pages/Dashboard/ChartComponents/Trend';
import { getDashboardSystemPerformance } from '@/services/rest/devicestat';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';

const SystemPerformanceCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [performancesStat, setPerformancesStat] = useState<API.PerformanceStat>(
    {
      currentCpu: 0,
      currentMem: 0,
      previousCpu: 0,
      previousMem: 0,
      danger: false,
      message: '',
    },
  );

  const asyncFetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDashboardSystemPerformance();
      setPerformancesStat(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  const title = useMemo(
    () => <Typography.Title level={5}>System Performance</Typography.Title>,
    [],
  );

  const action = useMemo(
    () => (
      <Tooltip title="System performance settings can be defined in settings">
        <InfoCircleFilled style={{ color: 'white' }} />
      </Tooltip>
    ),
    [],
  );

  const total = useMemo(
    () => (
      <div style={{ color: performancesStat?.danger ? '#b82727' : undefined }}>
        {performancesStat?.message}
      </div>
    ),
    [performancesStat],
  );

  const footer = useMemo(
    () => (
      <Field
        label={<Typography.Text>Current Avg. CPU/Mem:</Typography.Text>}
        value={
          <Typography.Text>
            {(performancesStat?.currentCpu || NaN).toFixed(2)}%/
            {(performancesStat?.currentMem || NaN).toFixed(2)}%
          </Typography.Text>
        }
      />
    ),
    [performancesStat],
  );

  const cpuTrendFlag = useMemo(
    () =>
      performancesStat?.previousCpu - performancesStat?.currentCpu > 0
        ? 'up'
        : 'down',
    [performancesStat],
  );

  const memTrendFlag = useMemo(
    () =>
      performancesStat?.previousMem - performancesStat?.currentMem > 0
        ? 'up'
        : 'down',
    [performancesStat],
  );

  return (
    <ChartCard
      bordered={false}
      title={title}
      action={action}
      loading={loading}
      total={total}
      footer={footer}
      contentHeight={60}
    >
      <Trend
        reverseColor={false}
        flag={cpuTrendFlag}
        style={{ marginRight: 16 }}
      >
        <Typography.Text>Weekly CPU Variation</Typography.Text>
        <span className={styles.trendText}>
          <Typography.Text>
            {(
              performancesStat?.previousCpu - performancesStat?.currentCpu
            ).toFixed(2)}
            %
          </Typography.Text>
        </span>
      </Trend>
      <Trend flag={memTrendFlag}>
        <Typography.Text>Weekly MEM Variation</Typography.Text>
        <span className={styles.trendText}>
          <Typography.Text>
            {(
              performancesStat?.previousMem - performancesStat?.currentMem
            ).toFixed(2)}
            %
          </Typography.Text>
        </span>
      </Trend>
    </ChartCard>
  );
};

export default React.memo(SystemPerformanceCard);

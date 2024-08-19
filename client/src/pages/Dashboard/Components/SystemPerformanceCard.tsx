import styles from '@/pages/Dashboard/Analysis.less';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import Trend from '@/pages/Dashboard/ChartComponents/Trend';
import { getDashboardSystemPerformance } from '@/services/rest/devicestat';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

const SystemPerformanceCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [performancesStat, setPerformancesStat] =
    React.useState<API.PerformanceStat>({
      currentCpu: 0,
      currentMem: 0,
      previousCpu: 0,
      previousMem: 0,
      danger: false,
      message: '',
    });

  const asyncFetch = async () => {
    setLoading(true);
    await getDashboardSystemPerformance()
      .then((response) => {
        setPerformancesStat(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    asyncFetch();
  }, []);

  return (
    <ChartCard
      bordered={false}
      title={<Typography.Title level={5}>System Performance</Typography.Title>}
      action={
        <Tooltip
          title={'System performance settings can be defined in settings'}
        >
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      loading={loading}
      total={() => (
        <Typography.Title
          level={2}
          type={performancesStat?.danger ? 'danger' : undefined}
        >
          {performancesStat?.message}
        </Typography.Title>
      )}
      footer={
        <Field
          label={<Typography.Text>Current Avg. CPU/Mem:</Typography.Text>}
          value={
            <Typography.Text>
              {performancesStat?.currentCpu?.toFixed(2)}%/
              {performancesStat?.currentMem?.toFixed(2)}%
            </Typography.Text>
          }
        />
      }
      contentHeight={80}
    >
      <Trend
        reverseColor={false}
        flag={
          performancesStat?.previousCpu - performancesStat?.currentCpu > 0
            ? 'up'
            : 'down'
        }
        style={{ marginRight: 16 }}
      >
        <Typography.Text>Weekly CPU Variation</Typography.Text>
        <span className={styles.trendText}>
          <Typography.Text>
            {(
              performancesStat.previousCpu - performancesStat.currentCpu
            ).toFixed(2)}
            %
          </Typography.Text>
        </span>
      </Trend>
      <Trend
        flag={
          performancesStat.previousMem - performancesStat.currentMem > 0
            ? 'up'
            : 'down'
        }
      >
        <Typography.Text>Weekly MEM Variation</Typography.Text>
        <span className={styles.trendText}>
          <Typography.Text>
            {(
              performancesStat.previousMem - performancesStat.currentMem
            ).toFixed(2)}
            %
          </Typography.Text>
        </span>
      </Trend>
    </ChartCard>
  );
};

export default SystemPerformanceCard;

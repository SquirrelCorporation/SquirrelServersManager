import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import { Tooltip, Typography } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import Trend from '@/pages/Dashboard/ChartComponents/Trend';
import styles from '@/pages/Dashboard/Analysis.less';
import React, { useEffect } from 'react';
import { getDashboardSystemPerformance } from '@/services/rest/devicestat';

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
    await getDashboardSystemPerformance()
      .then((response) => {
        setPerformancesStat(response.data);
      })
      .catch((error) => {
        console.log('fetch data failed', error);
      });
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
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
        <Typography.Text>Weekly CPU Changes</Typography.Text>
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
        <Typography.Text>Weekly MEM Changes</Typography.Text>
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

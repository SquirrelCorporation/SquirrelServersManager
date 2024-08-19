import styles from '@/pages/Dashboard/Analysis.less';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import MiniProgress from '@/pages/Dashboard/ChartComponents/MiniProgress';
import Trend from '@/pages/Dashboard/ChartComponents/Trend';
import { getDashboardAvailabilityStat } from '@/services/rest/devicestat';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

const AvailabilityCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [availabilityStat, setAvailabilityStat] = React.useState<
    API.AvailabilityStat | undefined
  >();
  const asyncFetch = async () => {
    setLoading(true);
    await getDashboardAvailabilityStat()
      .then((response) => {
        setAvailabilityStat(response.data);
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
      loading={loading}
      bordered={false}
      title={<Typography.Title level={5}>System Availability</Typography.Title>}
      action={
        <Tooltip title={'The percentage of uptime of your combined devices'}>
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      total={`${availabilityStat ? (availabilityStat.availability < 1 ? (availabilityStat.availability * 100).toFixed(5) : 100) : 'NaN'}%`}
      footer={
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
                : ''
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
      }
      contentHeight={80}
    >
      <MiniProgress
        percent={
          availabilityStat
            ? (availabilityStat.availability * 100).toFixed(0)
            : 0
        }
      />
    </ChartCard>
  );
};

export default AvailabilityCard;

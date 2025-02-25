import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import {
  getAveragedStats,
  getNbContainersByStatus,
} from '@/services/rest/containersstats';
import { Tiny } from '@ant-design/charts';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API, SsmStatus } from 'ssm-shared-lib';

const ContainersCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [nbRunning, setNbRunning] = useState<number>(0);
  const [nbTotal, setNbTotal] = useState<number>(0);
  const [stats, setStats] = useState<{ date: string; value: string }[]>([]);

  const asyncFetch = useCallback(async () => {
    setLoading(true);
    try {
      const [runningResponse, totalResponse, statsResponse] = await Promise.all(
        [
          getNbContainersByStatus(SsmStatus.ContainerStatus.RUNNING),
          getNbContainersByStatus('all'),
          getAveragedStats(),
        ],
      );

      setNbRunning(runningResponse.data);
      setNbTotal(totalResponse.data);
      const formattedStats = [
        ...(statsResponse.data?.cpuStats ?? []).map((e: API.ContainerStat) => ({
          type: 'cpu',
          value: `${e.value}`,
          date: moment(e.date, 'YYYY-MM-DD-HH-mm-ss').format(
            'YYYY-MM-DD, HH:mm',
          ),
        })),
        ...(statsResponse.data?.memStats ?? []).map((e: API.ContainerStat) => ({
          type: 'mem',
          value: `${e.value}`,
          date: moment(e.date, 'YYYY-MM-DD-HH-mm-ss').format(
            'YYYY-MM-DD, HH:mm',
          ),
        })),
      ];
      setStats(formattedStats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  const config = useMemo(
    () => ({
      height: 60,
      autoFit: true,
      xField: 'date',
      yField: 'value',
      colorField: 'type',
      paddingLeft: 0,
      paddingRight: 0,
      marginRight: 0,
      marginLeft: 0,
      tooltip: {
        channel: 'y',
        valueFormatter: (d: string) => `${parseFloat(d).toFixed(2)}%`,
      },
      data: stats,
      smooth: true,
      scale: {
        color: {
          range: [
            'linear-gradient(-90deg, rgba(24, 144, 255, 0.4) 0%, rgba(24, 144, 255, 0.2) 100%)',
            'linear-gradient(-90deg, rgba(239, 138, 98, 0.4) 0%, rgba(239, 138, 98, 0.2) 100%)',
          ],
        },
      },
    }),
    [stats],
  );

  return (
    <ChartCard
      loading={loading}
      title={<Typography.Title level={5}>Containers</Typography.Title>}
      action={
        <Tooltip title="The containers running on your devices and the averaged usage statistics">
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      total={`${nbRunning} RUNNING`}
      footer={
        <Field
          label={<Typography.Text>Out of</Typography.Text>}
          value={<Typography.Text>{nbTotal} total</Typography.Text>}
        />
      }
      contentHeight={60}
    >
      <Tiny.Area {...config} />
    </ChartCard>
  );
};

export default React.memo(ContainersCard);

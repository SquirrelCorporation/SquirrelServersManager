import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import {
  getAveragedStats,
  getNbContainersByStatus,
} from '@/services/rest/containersstats';
import { Tiny } from '@ant-design/charts';
import { InfoCircleFilled } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import React, { useEffect } from 'react';
import { ContainerStatus } from 'ssm-shared-lib/distribution/enums/status';
import { API } from 'ssm-shared-lib';

const ServicesCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [nbRunning, setNbRunning] = React.useState(0);
  const [nbTotal, setNbTotal] = React.useState(0);
  const [stats, setStats] = React.useState();

  const asyncFetch = async () => {
    await getNbContainersByStatus(ContainerStatus.RUNNING).then((response) => {
      setNbRunning(response.data);
    });
    await getNbContainersByStatus('all').then((response) => {
      setNbTotal(response.data);
    });
    await getAveragedStats().then((response) => {
      setStats(
        response.data?.cpuStats
          ?.map((e: API.ContainerStat) => ({ type: 'cpu', ...e }))
          ?.concat(
            response.data?.memStats?.map((e: API.ContainerStat) => ({
              type: 'mem',
              ...e,
            })),
          ),
      );
    });
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    asyncFetch();
  }, []);

  const config = {
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
    } /*
    style: {
      fill: 'linear-gradient(-90deg, rgba(24, 144, 255, 0.4) 0%, rgba(24, 144, 255, 0.2) 100%)',
    },*/,
  };

  return (
    <ChartCard
      bordered={false}
      loading={loading}
      title={<Typography.Title level={5}>Services</Typography.Title>}
      action={
        <Tooltip
          title={
            'The containers running on your devices and the averaged usage statistics'
          }
        >
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      total={
        <>
          <Typography.Title level={3}>{nbRunning} RUNNING</Typography.Title>
        </>
      }
      footer={
        <Field
          label={<Typography.Text>Out of</Typography.Text>}
          value={<Typography.Text>{nbTotal} total</Typography.Text>}
        />
      }
      contentHeight={80}
    >
      <Tiny.Area {...config} />
    </ChartCard>
  );
};

export default ServicesCard;

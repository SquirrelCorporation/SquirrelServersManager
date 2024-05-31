import { Tooltip, Typography } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import { Bar } from '@ant-design/plots';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import React from 'react';
import { useModel } from '@umijs/max';
import Devicestatus from '@/utils/devicestatus';
import { API } from 'ssm-shared-lib';

const CombinedPowerCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};
  const dataCpu =
    currentUser?.devices?.overview
      ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
      .map((device, index) => {
        return {
          type: 'cpu',
          uuid: `${index}-${device.name}`,
          value: (device.cpu || 0) / (currentUser?.devices?.totalCpu || 1),
        };
      }) || [];
  const dataMem =
    currentUser?.devices?.overview
      ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
      .map((device, index) => {
        return {
          type: 'mem',
          uuid: `${index}-${device.name}`,
          value:
            (device.mem || 0) / 1024 / (currentUser?.devices?.totalMem || 1),
        };
      }) || [];
  const data = dataCpu?.concat(dataMem);

  const config = {
    data: data,
    xField: 'type',
    yField: 'value',
    colorField: 'uuid',
    normalize: true,
    paddingTop: 20,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: -20,
    marginRight: 0,
    marginLeft: 0,
    stack: true,
    height: 100,
    //width: '100%',
    autoFit: true,
    legend: false,
    axis: { y: false, x: false },
    scale: {
      color: {
        range: [
          'linear-gradient(-180deg, rgba(34, 44, 205, 0.4) 0%, rgba(34, 44, 205, 0.2) 100%)',
          'linear-gradient(-180deg, rgba(239, 138, 8, 0.4) 0%, rgba(239, 138, 8, 0.2) 100%)',
          'linear-gradient(-180deg, rgba(29, 138, 98, 0.4) 0%, rgba(29, 138, 98, 0.2) 100%)',
        ],
      },
      y: {
        domain: [0, 1],
      },
    },
    tooltip: { channel: 'y0', valueFormatter: '.00%' },
  };

  return (
    <ChartCard
      bordered={false}
      loading={loading}
      title={<Typography.Title level={5}>Combined Power</Typography.Title>}
      action={
        <Tooltip title={'Sum of all your devices'}>
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      total={
        <Typography.Title level={3}>
          {currentUser?.devices?.totalCpu?.toFixed(0)} GhZ /{' '}
          {currentUser?.devices?.totalMem?.toFixed(0)} Gb{' '}
        </Typography.Title>
      }
      footer={
        <Field
          label={<Typography.Text>Of</Typography.Text>}
          value={
            <Typography.Text>
              {currentUser?.devices?.overview?.length} devices
            </Typography.Text>
          }
        />
      }
      contentHeight={80}
    >
      <Bar {...config} />
    </ChartCard>
  );
};

export default CombinedPowerCard;

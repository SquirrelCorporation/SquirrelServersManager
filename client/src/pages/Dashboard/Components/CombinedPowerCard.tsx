import { Tooltip, Typography } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import { Bar } from '@ant-design/plots';
import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import React from 'react';
import { useModel } from '@umijs/max';

const CombinedPowerCard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};
  const dataCpu =
    currentUser?.devices?.overview?.map((device, index) => {
      return {
        type: 'cpu',
        uuid: `${index}-${device.name}`,
        value: (device.cpu || 0) / (currentUser?.devices?.totalCpu || 1),
      };
    }) || [];
  const dataMem =
    currentUser?.devices?.overview?.map((device, index) => {
      return {
        type: 'mem',
        uuid: `${index}-${device.name}`,
        value: (device.mem || 0) / 1024 / (currentUser?.devices?.totalMem || 1),
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
    stack: true,
    height: 100,
    autoFit: true,
    legend: false,
    axis: { y: false, x: false },
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
          {currentUser?.devices?.totalCpu?.toFixed(2)} GhZ /{' '}
          {currentUser?.devices?.totalMem?.toFixed(2)} Gb{' '}
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

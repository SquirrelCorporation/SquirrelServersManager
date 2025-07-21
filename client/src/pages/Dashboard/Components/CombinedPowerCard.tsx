import ChartCard from '@/pages/Dashboard/ChartComponents/ChartCard';
import Field from '@/pages/Dashboard/ChartComponents/Field';
import Devicestatus from '@/utils/devicestatus';
import { InfoCircleFilled } from '@ant-design/icons';
import { Bar } from '@ant-design/plots';
import { useModel } from '@umijs/max';
import { Tooltip, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { API } from 'ssm-shared-lib';

const CombinedPowerCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser }: { currentUser: API.CurrentUser } = initialState || {};

  const dataCpu = useMemo(
    () =>
      currentUser?.devices?.overview
        ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
        .map((device, index) => ({
          type: 'cpu',
          uuid: `${index}-${device.name}`,
          value: (device.cpu || 0) / (currentUser?.devices?.totalCpu || 1),
        })) || [],
    [currentUser],
  );

  const dataMem = useMemo(
    () =>
      currentUser?.devices?.overview
        ?.filter((e) => e.status !== Devicestatus.UNMANAGED)
        .map((device, index) => ({
          type: 'mem',
          uuid: `${index}-${device.name}`,
          value:
            (device.mem || 0) /
            (1024 * 1024 * 1024) /
            ((currentUser?.devices?.totalMem
              ? currentUser?.devices?.totalMem / (1024 * 1024 * 1024)
              : undefined) || 1),
        })) || [],
    [currentUser],
  );

  const data = useMemo(() => dataCpu.concat(dataMem), [dataCpu, dataMem]);

  const config = useMemo(
    () => ({
      data,
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
      tooltip: {
        channel: 'y0',
        valueFormatter: (val: number) => val.toFixed(2) + '%',
      },
    }),
    [data],
  );

  return (
    <ChartCard
      loading={loading}
      title={
        <Typography.Title style={{ fontSize: '14px' }}>
          Combined Power
        </Typography.Title>
      }
      action={
        <Tooltip title="Sum of all your devices">
          <InfoCircleFilled style={{ color: 'white' }} />
        </Tooltip>
      }
      total={`
          ${currentUser?.devices?.totalCpu?.toFixed(1)} GHz /
          ${(currentUser?.devices?.totalMem ? currentUser?.devices?.totalMem / (1024 * 1024 * 1024) : undefined)?.toFixed(0)} Gb
       `}
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
      contentHeight={60}
    >
      <Bar {...config} />
    </ChartCard>
  );
};

export default React.memo(CombinedPowerCard);

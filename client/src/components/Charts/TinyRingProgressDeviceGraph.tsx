import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import { getDeviceStat } from '@/services/rest/devicestat';
import { Tiny } from '@ant-design/plots';
import { message, Skeleton, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

export type TinyRingProps = {
  deviceUuid: string;
  type: DeviceStatType;
};

const TinyRingProgressDeviceGraph: React.FC<TinyRingProps> = (
  props: TinyRingProps,
) => {
  const [value, setValue] = useState<{ percent: number; date: string }>({
    percent: 0,
    date: 'never',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const asyncFetch = async () => {
    await getDeviceStat(props.deviceUuid, props.type, {}).then((res) => {
      if (res.data && res.data.value) {
        setValue({
          percent: parseFloat((res.data.value / 100).toFixed(2)),
          date: moment(res.data.date).format('YYYY-MM-DD, HH:mm'),
        });
      }
    });
    setIsLoading(false);
  };
  useEffect(() => {
    setIsLoading(true);
    asyncFetch();
  }, []);

  const config = {
    percent: value.percent.toFixed(2),
    width: 50,
    height: 50,
    color: [
      'rgba(232,237,243,0.4)',
      value.percent < 0.8 ? '#1668dc' : '#dc4446',
    ],
    innerRadius: 0.85,
    radius: 0.98,
    loading: false,
    annotations: [
      {
        type: 'text',
        style: {
          text: `${(value.percent * 100).toFixed(0)}%`,
          x: '50%',
          y: '45%',
          textAlign: 'center',
          fontSize: 12,
          fill: `${value.percent < 0.8 ? 'rgba(232,237,243,0.9)' : '#dc4446'}`,
          fontStyle: 'bold',
        },
      },
      {
        type: 'text',
        style: {
          text: `${props.type === DeviceStatType.CPU ? 'cpu' : 'mem'}`,
          x: '48%',
          y: '68%',
          textAlign: 'center',
          fontSize: 8,
          fill: 'rgba(232,237,243,0.9)',
          fillOpacity: 0.95,
          fontStyle: 'normal',
        },
      },
    ],
  };

  return isLoading || !value ? (
    <Skeleton.Avatar active size={'large'} shape={'circle'} />
  ) : (
    <Tooltip title={`Updated at ${value.date}`}>
      <Tiny.Ring {...config} />{' '}
    </Tooltip>
  );
};

export default TinyRingProgressDeviceGraph;

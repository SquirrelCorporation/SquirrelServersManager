import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import { getDeviceStat } from '@/services/rest/devicestat';
import { Tiny } from '@ant-design/plots';
import { message, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';

export type TinyRingProps = {
  deviceUuid: string;
  type: DeviceStatType;
};

const TinyRingProgressDeviceIndicator: React.FC<TinyRingProps> = (
  props: TinyRingProps,
) => {
  const [value, setValue] = useState<number>(NaN);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const asyncFetch = async () => {
    await getDeviceStat(props.deviceUuid, props.type, {})
      .then((res) => {
        if (res.data && !isNaN(res.data.value)) {
          setValue(res.data.value);
        }
      })
      .catch((error) => {
        message.error({ content: error.message, duration: 8 });
      });
    setIsLoading(false);
  };
  useEffect(() => {
    setIsLoading(true);
    asyncFetch();
  }, []);

  const config = {
    percent: 1,
    width: 50,
    height: 50,
    //color: ['rgba(232,237,243,0.4)', parseFloat(value.percent) < 0.8 ? '#1668dc' : '#dc4446'],
    innerRadius: 0.85,
    radius: 0.98,
    loading: false,
    annotations: [
      {
        type: 'text',
        style: {
          text: `${value}`,
          x: '50%',
          y: '40%',
          textAlign: 'center',
          fontSize: 12,
          fill: 'rgba(232,237,243,0.9)',
          fontStyle: 'bold',
        },
      },
      {
        type: 'text',
        style: {
          text: `Services`,
          x: '48%',
          y: '60%',
          textAlign: 'center',
          fontSize: 8,
          fill: 'rgba(232,237,243,0.9)',
          fillOpacity: 0.95,
          fontStyle: 'normal',
        },
      },
    ],
  };

  return isLoading || isNaN(value) ? (
    <Skeleton.Avatar active size={'large'} shape={'circle'} />
  ) : (
    <Tiny.Ring {...config} />
  );
};

export default TinyRingProgressDeviceIndicator;

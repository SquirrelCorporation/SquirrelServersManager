import { Tiny } from '@ant-design/plots';
import { Skeleton, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

export type TinyRingProps = {
  deviceUuid: string;
};

const TinyRingProgressDeviceIndicator: React.FC<TinyRingProps> = (
  props: TinyRingProps,
) => {
  const [value, setValue] = useState<{ percent: number; date: string }>({
    percent: 0,
    date: 'never',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const asyncFetch = async () => {
    setValue({
      percent: 1,
      date: moment(new Date()).format('YYYY-MM-DD, HH:mm'),
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
    //color: ['rgba(232,237,243,0.4)', parseFloat(value.percent) < 0.8 ? '#1668dc' : '#dc4446'],
    innerRadius: 0.85,
    radius: 0.98,
    loading: false,
    annotations: [
      {
        type: 'text',
        style: {
          text: `1`,
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

  return isLoading || !value ? (
    <Skeleton.Avatar active size={'large'} shape={'circle'} />
  ) : (
    <Tooltip title={`Updated at ${value.date}`}>
      <Tiny.Ring {...config} />{' '}
    </Tooltip>
  );
};

export default TinyRingProgressDeviceIndicator;

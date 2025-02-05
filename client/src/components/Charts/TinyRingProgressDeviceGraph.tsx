import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import { getDeviceStat } from '@/services/rest/devicestat';
import { Tiny } from '@ant-design/charts';
import { TinyRingConfig } from '@ant-design/plots/es/components/tiny';
import { Skeleton, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

export type TinyRingProps = {
  deviceUuid: string;
  type: DeviceStatType;
};

const TinyRingProgressDeviceGraph: React.FC<TinyRingProps> = ({
  deviceUuid,
  type,
}) => {
  const [value, setValue] = useState<{ percent: number; date: string }>({
    percent: 0,
    date: 'never',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const asyncFetch = useCallback(async () => {
    try {
      const res = await getDeviceStat(deviceUuid, type);
      if (res.data && res.data.value) {
        setValue({
          percent: parseFloat((res.data.value / 100).toFixed(2)),
          date: moment(res.data.date).format('YYYY-MM-DD, HH:mm'),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [deviceUuid, type]);

  useEffect(() => {
    setIsLoading(true);
    void asyncFetch();
  }, [asyncFetch]);

  const config: TinyRingConfig = useMemo(
    () => ({
      percent: value.percent,
      width: 50,
      height: 50,
      color: ['rgb(255,255,255)', value.percent < 0.8 ? '#1668dc' : '#dc4446'],
      innerRadius: 0.92,
      radius: 0.98,
      annotations: [
        {
          type: 'text',
          style: {
            text: `${((value.percent ?? 0) * 100).toFixed(0)}%`,
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
            text: `${type === DeviceStatType.CPU ? 'cpu' : 'mem'}`,
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
    }),
    [value, type, deviceUuid],
  );

  return isLoading ? (
    <Skeleton.Avatar active size="large" shape="circle" />
  ) : (
    <Tooltip title={`Updated at ${value.date}`}>
      <Tiny.Ring key={`${deviceUuid}-${type}`} {...config} />
    </Tooltip>
  );
};

export default React.memo(TinyRingProgressDeviceGraph);

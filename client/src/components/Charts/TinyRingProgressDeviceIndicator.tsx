import { getDeviceStat } from '@/services/rest/stastistics';
import { Tiny, TinyProgressConfig } from '@ant-design/charts';
import { message, Skeleton } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatsType } from 'ssm-shared-lib';

export type TinyRingProps = {
  deviceUuid: string;
  type: StatsType.DeviceStatsType;
};

const TinyRingProgressDeviceIndicator: React.FC<TinyRingProps> = ({
  deviceUuid,
  type,
}) => {
  const [value, setValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const asyncFetch = useCallback(async () => {
    try {
      const res = await getDeviceStat(deviceUuid, type, {});

      if (res.data && !isNaN(res.data.value)) {
        setValue(res.data.value);
      } else {
        setValue(NaN);
      }
    } catch (error: any) {
      message.error({ content: error.message, duration: 8 });
      setValue(NaN);
    } finally {
      setIsLoading(false);
    }
  }, [deviceUuid, type]);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  const config: TinyProgressConfig = useMemo(
    () => ({
      percent: 0.0,
      width: 50,
      height: 50,
      innerRadius: 0.92,
      radius: 0.98,
      color: ['#ffffff', '#1668dc'],
      annotations: [
        {
          type: 'text',
          style: {
            text: `${value ?? '0'}`,
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
            text: 'Containers',
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
    }),
    [value, deviceUuid, type],
  );

  return isLoading || isNaN(value as number) ? (
    <Skeleton.Avatar active size="large" shape="circle" />
  ) : (
    <>
      <Tiny.Ring key={`${deviceUuid}-${type}`} {...config} />
    </>
  );
};

export default React.memo(TinyRingProgressDeviceIndicator);

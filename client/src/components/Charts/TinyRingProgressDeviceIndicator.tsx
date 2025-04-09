import { getDeviceStat } from '@/services/rest/stastistics';
import message from '@/components/Message/DynamicMessage';
import { Skeleton, Tooltip } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatsType } from 'ssm-shared-lib';
import CountDisplay from '@/components/Indicators/CountDisplay';
import moment from 'moment';

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
  const [date, setDate] = useState<string>('never');

  const asyncFetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getDeviceStat(deviceUuid, type, {});

      if (
        res.data &&
        typeof res.data.value === 'number' &&
        !isNaN(res.data.value)
      ) {
        setValue(res.data.value);
        setDate(moment(res.data.date).format('YYYY-MM-DD, HH:mm'));
      } else {
        console.warn(
          `Invalid count value received for ${type} on ${deviceUuid}`,
        );
        setValue(NaN);
        setDate('invalid data');
      }
    } catch (error: any) {
      message.error({ content: error.message, duration: 8 });
      setValue(NaN);
      setDate('error');
    } finally {
      setIsLoading(false);
    }
  }, [deviceUuid, type]);

  useEffect(() => {
    void asyncFetch();
  }, [asyncFetch]);

  const tooltipText =
    date !== 'never' && date !== 'error' && date !== 'invalid data'
      ? `Updated at ${date}`
      : 'Failed to load data';

  return (
    <CountDisplay
      key={`${deviceUuid}-${type}`}
      count={value}
      isLoading={isLoading}
      size={46}
      tooltipText={tooltipText}
      label="CTX"
    />
  );
};

export default React.memo(TinyRingProgressDeviceIndicator);

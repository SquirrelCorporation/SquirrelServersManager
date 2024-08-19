import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import { getDeviceStats } from '@/services/rest/devicestat';
import { Tiny } from '@ant-design/plots';
import { message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { API } from 'ssm-shared-lib';

export type TinyLineProps = {
  deviceUuid: string;
  type: DeviceStatType;
  from: number;
};

const TinyLineDeviceGraph: React.FC<TinyLineProps> = ({
  deviceUuid,
  type,
  from,
}) => {
  const [data, setData] = useState<API.DeviceStat[]>([]);

  const formatData = useCallback((list: API.DeviceStats) => {
    if (!list?.data) {
      return [];
    }

    const formattedData = list.data.map((e) => ({
      date: moment(e.date).format('YYYY-MM-DD, HH:mm'),
      value: parseFloat((e.value / 100).toFixed(2)),
    }));

    return Array.from(new Set(formattedData.map((d) => d.date))).map(
      (date) => formattedData.find((d) => d.date === date) as API.DeviceStat,
    );
  }, []);

  const asyncFetch = useCallback(async () => {
    try {
      const list = await getDeviceStats(deviceUuid, type, { from });
      setData(formatData(list));
    } catch (error: any) {
      message.error(error);
    }
  }, [deviceUuid, type, from, formatData]);

  useEffect(() => {
    asyncFetch();
  }, [asyncFetch]);

  const config = useMemo(
    () => ({
      title: 'CPU',
      data,
      autoFit: false,
      width: 280,
      height: 55,
      shapeField: 'smooth',
      xField: 'date',
      yField: 'value',
      padding: 10,
      tooltip: { channel: 'y', valueFormatter: '.2%' },
      interaction: { tooltip: { mount: 'body' } },
    }),
    [data],
  );

  return <Tiny.Line {...config} />;
};

export default React.memo(TinyLineDeviceGraph);

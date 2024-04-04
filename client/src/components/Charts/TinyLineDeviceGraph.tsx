import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import { getDeviceStats } from '@/services/rest/devicestat';
import { Tiny } from '@ant-design/plots';
import { message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

export type TinyLineProps = {
  deviceUuid: string;
  type: DeviceStatType;
  from: number;
};

const TinyLineDeviceGraph = (props: TinyLineProps) => {
  const [data, setData] = useState<API.DeviceStat[]>([]);

  const formatData = (list: API.DeviceStats) => {
    return list?.data
      ? list.data
          .map((e) => {
            return {
              date: moment(e.date).format('YYYY-MM-DD, HH:mm'),
              value: parseFloat((e.value / 100).toFixed(2)),
            };
          })
          .reduce((accumulator: API.DeviceStat[], current) => {
            if (!accumulator.find((item) => item.date === current.date)) {
              accumulator.push(current);
            }
            return accumulator;
          }, [])
      : [];
  };
  const asyncFetch = async () => {
    await getDeviceStats(props.deviceUuid, props.type, { from: props.from })
      .then((list) => {
        setData(formatData(list));
      })
      .catch((error) => {
        message.error(error);
      });
  };
  useEffect(() => {
    asyncFetch();
  }, []);

  const config = {
    title: 'CPU',
    data: data,
    autoFit: false,
    width: 280,
    height: 55,
    shapeField: 'smooth',
    xField: 'date',
    yField: 'value',
    padding: 10,
    tooltip: { channel: 'y', valueFormatter: '.2%' },
    interaction: { tooltip: { mount: 'body' } },
  };
  // @ts-ignore
  return <Tiny.Line {...config} />;
};

export default TinyLineDeviceGraph;

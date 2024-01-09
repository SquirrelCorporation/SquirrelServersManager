import { DeviceStatType } from '@/components/Charts/DeviceStatType';
import { getDeviceStats } from '@/services/ant-design-pro/devicestat';
import { Tiny } from '@ant-design/plots';
import { message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

export type TinyLineProps = {
  deviceUuid: string;
  type: DeviceStatType;
  from: number;
};

const TinyLine = (props: TinyLineProps) => {
  const [data, setData] = useState<API.DeviceStat[]>([{}]);

  const cleanData = (list: API.DeviceStats) => {
    return list?.data
      ? list.data
          .map((e) => {
            console.log(parseFloat((e.value / 100).toFixed(2)));
            return {
              date: moment(e.date).format('YYYY-MM-DD, HH:mm:ss'),
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
        setData(cleanData(list));
      })
      .catch((error) => {
        message.error(error);
      });
  };
  useEffect(() => {
    asyncFetch();
  }, []);

  const config = {
    data,
    autoFit: false,
    width: 280,
    height: 60,
    shapeField: 'smooth',
    xField: 'date',
    yField: 'value',
    padding: 10,
    tooltip: { channel: 'y', valueFormatter: '.2%' },
    theme: 'classicDark',
  };
  // @ts-ignore
  return <Tiny.Line {...config} />;
};

export default TinyLine;

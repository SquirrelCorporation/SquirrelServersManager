import { getContainerStats } from '@/services/rest/containers';
import moment from 'moment';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib/distribution';
import { Line } from '@ant-design/plots';

export type ContainerStatsDetailProps = {
  containerId?: string;
  type: string;
};

const ContainerStatsDetail: React.FC<ContainerStatsDetailProps> = (
  props: ContainerStatsDetailProps,
) => {
  const { containerId, type } = props;
  const [data, setData] = React.useState<API.ContainerStat[] | undefined>();

  const formatData = (list: API.ContainerStats) => {
    return list?.data
      ? list.data
          .map((e: { date: string; value: number }) => {
            return {
              date: moment(e.date).format('YYYY-MM-DD, HH:mm'),
              value: parseFloat(e.value.toFixed(2)),
            };
          })
          .reduce((accumulator: API.ContainerStat[], current) => {
            if (!accumulator.find((item) => item.date === current.date)) {
              accumulator.push(current);
            }
            return accumulator;
          }, [])
      : [];
  };

  const asyncFetch = async () => {
    if (!containerId) {
      return;
    }
    getContainerStats(containerId, type).then((e) => {
      setData(formatData(e));
    });
  };

  useEffect(() => {
    asyncFetch();
  });

  const config = {
    animate: { enter: { type: 'waveIn' } },
    legend: {
      color: {
        itemLabelFill: '#fff',
      },
    },
    axis: {
      x: {
        labelFill: '#fff',
        label: false,
      },
      y: {
        labelFill: '#fff',
        labelFormatter: (v: string) => `${v}%`,
      },
    },
    data: data,
    autoFit: false,
    theme: {
      view: {
        viewFill: '#1d222e',
      },
    },
    width: 280,
    height: 150,
    shapeField: 'smooth',
    xField: 'date',
    yField: 'value',
    scale: {
      y: { nice: true },
    },
    tooltip: { channel: 'y', valueFormatter: (d: string) => `${d}%` },
    paddingLeft: 20,
  };
  // @ts-ignore
  return <Line {...config} />;
};

export default ContainerStatsDetail;

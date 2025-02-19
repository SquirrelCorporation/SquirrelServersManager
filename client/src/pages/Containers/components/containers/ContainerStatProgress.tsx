import ContainerStatsDetail from '@/pages/Containers/components/containers/ContainerStatsDetail';
import { getContainerStat } from '@/services/rest/containers';
import { Popover, Progress } from 'antd';
import React from 'react';
import { StatsType } from 'ssm-shared-lib';

export type ProgressProps = {
  containerId?: string;
};

const ContainerStatProgress: React.FC<ProgressProps> = (
  props: ProgressProps,
) => {
  const [cpu, setCpu] = React.useState<number>(Number.NaN);
  const [mem, setMem] = React.useState<number>(Number.NaN);

  const asyncFetch = async () => {
    if (props.containerId) {
      getContainerStat(
        props.containerId,
        StatsType.ContainerStatsType.CPU,
      ).then((e) => {
        setCpu(e.data?.value);
      });
      getContainerStat(
        props.containerId,
        StatsType.ContainerStatsType.MEM,
      ).then((e) => {
        setMem(e.data?.value);
      });
    }
  };

  React.useEffect(() => {
    void asyncFetch();
  }, []);

  return (
    <>
      <Popover
        title="CPU Usage Evolution"
        content={
          <ContainerStatsDetail
            type={StatsType.ContainerStatsType.CPU}
            containerId={props.containerId}
          />
        }
      >
        <Progress
          strokeColor={{ from: '#10e967', to: '#d12b44' }}
          size={'small'}
          percent={cpu}
        />
      </Popover>{' '}
      <Popover
        title="Memory Usage Evolution"
        content={
          <ContainerStatsDetail
            type={StatsType.ContainerStatsType.MEM}
            containerId={props.containerId}
          />
        }
      >
        <Progress
          strokeColor={{ from: '#10e967', to: '#d12b44' }}
          size={'small'}
          percent={mem}
        />
      </Popover>
    </>
  );
};

export default ContainerStatProgress;

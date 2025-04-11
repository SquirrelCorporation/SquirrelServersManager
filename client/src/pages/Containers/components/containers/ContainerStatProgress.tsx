import ContainerStatsDetail from '@/pages/Containers/components/containers/ContainerStatsDetail';
import { getContainerStat } from '@/services/rest/containers/container-statistics';
import { Popover, Progress } from 'antd';
import React from 'react';
import { StatsType } from 'ssm-shared-lib';

export type ProgressProps = {
  containerId?: string;
};

const ContainerStatProgress: React.FC<ProgressProps> = ({ containerId }) => {
  const [cpu, setCpu] = React.useState<number>(Number.NaN);
  const [mem, setMem] = React.useState<number>(Number.NaN);

  const asyncFetch = async () => {
    if (containerId) {
      getContainerStat(containerId, StatsType.ContainerStatsType.CPU).then(
        (e) => {
          setCpu(e.data?.value);
        },
      );
      getContainerStat(containerId, StatsType.ContainerStatsType.MEM).then(
        (e) => {
          setMem(e.data?.value);
        },
      );
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
            containerId={containerId}
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
            containerId={containerId}
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

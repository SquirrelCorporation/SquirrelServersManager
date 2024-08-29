import ContainerStatsDetail from '@/pages/Containers/components/containers/ContainerStatsDetail';
import { getContainerStat } from '@/services/rest/containers';
import { Popover, Progress } from 'antd';
import React from 'react';

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
      getContainerStat(props.containerId, 'cpu').then((e) => {
        setCpu(e.data?.value);
      });
      getContainerStat(props.containerId, 'mem').then((e) => {
        setMem(e.data?.value);
      });
    }
  };

  React.useEffect(() => {
    asyncFetch();
  }, []);

  return (
    <>
      <Popover
        title="CPU Usage Evolution"
        content={
          <ContainerStatsDetail type={'cpu'} containerId={props.containerId} />
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
          <ContainerStatsDetail type={'mem'} containerId={props.containerId} />
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

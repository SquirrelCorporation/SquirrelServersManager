import ContainerStatsDetail from '@/pages/Containers/components/containers/ContainerStatsDetail';
import { getContainerStat } from '@/services/rest/containers/container-statistics';
import { Popover, Progress, Grid, Flex, Typography } from 'antd';
import React from 'react';
import { StatsType } from 'ssm-shared-lib';

export type ProgressProps = {
  containerId?: string;
};

// Helper to format percentage, handling NaN
const formatPercentage = (value: number | undefined | null): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  return `${value.toFixed(0)}%`;
};

const ContainerStatProgress: React.FC<ProgressProps> = ({ containerId }) => {
  const [cpu, setCpu] = React.useState<number>(Number.NaN);
  const [mem, setMem] = React.useState<number>(Number.NaN);
  const screens = Grid.useBreakpoint();

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

  // Determine Flex direction based on screen size
  const flexIsVertical = !screens.sm;

  // Render based on screen size
  if (screens.sm) {
    // Render for larger screens (sm and up)
    const lineProgressProps: Partial<React.ComponentProps<typeof Progress>> = {
      type: 'line',
      size: 'default',
      showInfo: true,
      style: { width: '100%' }, // Keep the width style attempt
    };
    return (
      <Flex
        vertical={false} // Always horizontal here
        gap={'middle'}
        style={{ flexGrow: 1 }} // Keep flexGrow for horizontal layout
      >
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
            percent={cpu}
            {...lineProgressProps}
          />
        </Popover>
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
            percent={mem}
            {...lineProgressProps}
          />
        </Popover>
      </Flex>
    );
  } else {
    // Render for smaller screens (xs)
    return (
      <Flex
        vertical={true} // Always vertical here
        gap={'small'}
        style={{ marginTop: '10px', alignItems: 'center' }} // Keep flexGrow for horizontal layout
        // No specific style needed, let content determine size
      >
        <Typography.Text>
          {cpu && (
            <>
              CPU: <b>{formatPercentage(cpu)}</b>
            </>
          )}{' '}
          {mem && (
            <>
              MEM: <b>{formatPercentage(mem)}</b>
            </>
          )}
        </Typography.Text>
      </Flex>
    );
  }
};

export default ContainerStatProgress;

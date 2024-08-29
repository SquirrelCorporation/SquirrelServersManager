import { Live24Filled } from '@/components/Icons/CustomIcons';
import LiveLogs, { LiveLogsHandles } from '@/components/LiveLogs/LiveLogs';
import LiveLogsToolbar from '@/components/LiveLogs/LiveLogsToolbar';
import Title, { TitleColors } from '@/components/Template/Title';
import { PageContainer } from '@ant-design/pro-components';
import moment from 'moment';
import React, { RefObject, useState } from 'react';

const Logs: React.FC = () => {
  const ref: RefObject<LiveLogsHandles> = React.createRef<LiveLogsHandles>();
  const [fromDate, setFromDate] = useState(moment().unix());

  const onClickStop = () => {
    ref.current?.handleStop();
  };

  return (
    <PageContainer
      title={
        <Title.MainTitle
          backgroundColor={TitleColors.CONTAINER_LOGS}
          title={'Live Logs'}
          icon={<Live24Filled />}
        />
      }
    >
      <LiveLogsToolbar
        fromDate={fromDate}
        setFromDate={setFromDate}
        onStop={onClickStop}
      />
      <LiveLogs ref={ref} from={fromDate} />
    </PageContainer>
  );
};

export default Logs;

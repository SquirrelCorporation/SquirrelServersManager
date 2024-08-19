import { Live24Filled } from '@/components/Icons/CustomIcons';
import LiveLogs, { LiveLogsHandles } from '@/components/LiveLogs/LiveLogs';
import LiveLogsToolbar from '@/components/LiveLogs/LiveLogsToolbar';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import { PageContainer } from '@ant-design/pro-components';
import moment from 'moment';
import React, { RefObject, useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';

const Logs: React.FC = () => {
  const ref: RefObject<LiveLogsHandles> = React.createRef<LiveLogsHandles>();
  const [fromDate, setFromDate] = useState(moment().unix());

  const onClickStop = () => {
    ref.current?.handleStop();
  };

  return (
    <TerminalContextProvider>
      <PageContainer
        title={
          <Title.MainTitle
            backgroundColor={PageContainerTitleColors.CONTAINER_LOGS}
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
    </TerminalContextProvider>
  );
};

export default Logs;

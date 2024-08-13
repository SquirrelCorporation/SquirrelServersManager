import { Live24Filled } from '@/components/Icons/CustomIcons';
import LiveLogs from '@/components/LiveLogs/LiveLogs';
import LiveLogsToolbar from '@/components/LiveLogs/LiveLogsToolbar';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';
import { TerminalContextProvider } from 'react-terminal';

const Logs: React.FC = () => {
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
        <LiveLogsToolbar />
        <LiveLogs />
      </PageContainer>
    </TerminalContextProvider>
  );
};

export default Logs;

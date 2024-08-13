import { Live24Filled } from '@/components/Icons/CustomIcons';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import DeviceSSHTerminalCore from '@/pages/Devices/DeviceSSHTerminalCore';
import { PageContainer } from '@ant-design/pro-components';
import React, { memo, useEffect, useState } from 'react';
import {
  ReactTerminal,
  TerminalContextProvider,
  TerminalContext,
} from 'react-terminal';

const DeviceSSHTerminal = () => {
  return (
    <TerminalContextProvider>
      <PageContainer
        title={
          <Title.MainTitle
            backgroundColor={PageContainerTitleColors.CONTAINER_LOGS}
            title={'SSH'}
            icon={<Live24Filled />}
          />
        }
      >
        <DeviceSSHTerminalCore />
      </PageContainer>
    </TerminalContextProvider>
  );
};

export default DeviceSSHTerminal;

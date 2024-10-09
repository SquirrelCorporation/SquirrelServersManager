import { ProFormRadio } from '@ant-design/pro-components';
import React from 'react';
import { SsmAgent } from 'ssm-shared-lib';

const AgentInstallMethod = ({
  initialValue = SsmAgent.InstallMethods.NODE,
}) => (
  <ProFormRadio.Group
    layout={'vertical'}
    initialValue={initialValue}
    options={[
      {
        label: 'NodeJS Agent - Default (Recommended)',
        value: SsmAgent.InstallMethods.NODE,
      },
      {
        label: 'NodeJS Agent - Enhanced Playbook (Experimental)',
        value: SsmAgent.InstallMethods.NODE_ENHANCED_PLAYBOOK,
      },
      {
        label: 'Dockerized Agent (Experimental)',
        value: SsmAgent.InstallMethods.DOCKER,
      },
    ]}
    name={'installMethod'}
    rules={[{ required: false }]}
  />
);

export default AgentInstallMethod;

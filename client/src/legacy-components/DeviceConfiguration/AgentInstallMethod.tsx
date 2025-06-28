import { ProFormRadio } from '@ant-design/pro-components';
import React from 'react';
import { SsmAgent } from 'ssm-shared-lib';

const AgentInstallMethod = ({
  initialValue = SsmAgent.InstallMethods.LESS,
}) => (
  <ProFormRadio.Group
    layout={'vertical'}
    initialValue={initialValue}
    options={[
      {
        label: 'AgentLess (Recommended)',
        value: SsmAgent.InstallMethods.LESS,
      },
      {
        label: 'NodeJS Agent - Default (Deprecated)',
        value: SsmAgent.InstallMethods.NODE,
      },
      {
        label: 'NodeJS Agent - Enhanced Playbook (Deprecated)',
        value: SsmAgent.InstallMethods.NODE_ENHANCED_PLAYBOOK,
      },
      {
        label: 'Dockerized Agent (Deprecated)',
        value: SsmAgent.InstallMethods.DOCKER,
      },
    ]}
    name={'installMethod'}
    rules={[{ required: false }]}
  />
);

export default AgentInstallMethod;

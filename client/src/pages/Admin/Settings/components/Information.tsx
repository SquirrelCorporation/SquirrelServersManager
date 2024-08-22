import { useModel } from '@umijs/max';
import { Descriptions, Flex } from 'antd';
import React from 'react';
import { version } from '../../../../../package.json';

const Information: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  return (
    <Flex vertical gap={32} style={{ width: '80%' }}>
      <Descriptions title="Client Information">
        <Descriptions.Item label="Version">{version}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Server Information">
        <Descriptions.Item label="Version">
          {currentUser?.settings?.server.version}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Ansible">
        {currentUser?.settings?.server.ansibleVersion
          ?.split('\n')
          .map((e: any) => (
            <Descriptions.Item contentStyle={{ fontSize: '12px' }} key={e}>
              {e}
            </Descriptions.Item>
          ))}
      </Descriptions>
      <Descriptions title="Ansible Runner">
        <Descriptions.Item label={'Version'}>
          {currentUser?.settings?.server.ansibleRunnerVersion}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Server Deps">
        {Object.keys(currentUser?.settings?.server.deps).map((e) => (
          <Descriptions.Item key={e} label={e}>
            {currentUser?.settings?.server.deps[e]}
          </Descriptions.Item>
        ))}
      </Descriptions>
      <Descriptions title="Server Processes">
        {Object.keys(currentUser?.settings?.server.processes).map((e) => (
          <Descriptions.Item key={e} label={e}>
            {currentUser?.settings?.server.processes[e]}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Flex>
  );
};

export default Information;

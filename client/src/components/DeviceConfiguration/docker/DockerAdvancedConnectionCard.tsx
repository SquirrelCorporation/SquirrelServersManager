import { OuiMlCreateAdvancedJob } from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import {
  ProForm,
  ProFormDependency,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { Card, Tooltip } from 'antd';
import React from 'react';

const DockerAdvancedConnectionCard = () => {
  return (
    <Card
      type="inner"
      title={
        <CardHeader
          title={'Docker Advanced Connection'}
          color={'#1e4f5a'}
          icon={<OuiMlCreateAdvancedJob />}
        />
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 45, minHeight: 45, paddingLeft: 15 },
        body: { paddingBottom: 0 },
      }}
    >
      <ProForm.Group>
        <ProFormDependency name={['customDockerForcev4']}>
          {({ customDockerForcev4 }) => (
            <ProFormSwitch
              name="customDockerForcev6"
              label={
                <Tooltip
                  title={'Only connect via resolved IPv4 address for host.'}
                >
                  Force IPV6
                </Tooltip>
              }
              disabled={customDockerForcev4}
            />
          )}
        </ProFormDependency>
        <ProFormDependency name={['customDockerForcev6']}>
          {({ customDockerForcev6 }) => (
            <ProFormSwitch
              name="customDockerForcev4"
              label={
                <Tooltip
                  title={'Only connect via resolved IPv6 address for host.'}
                >
                  Force IPV4
                </Tooltip>
              }
              disabled={customDockerForcev6}
            />
          )}
        </ProFormDependency>
        <ProFormSwitch
          name="customDockerAgentForward"
          label={
            <Tooltip
              title={
                'Use OpenSSH agent forwarding (auth-agent@openssh. com) for Docker authentication.'
              }
            >
              SSH Agent Forwarding
            </Tooltip>
          }
        />
        <ProFormSwitch
          name="insecure"
          label={
            <Tooltip
              title={
                'Do not verify certs when connecting inside docker-engine.'
              }
            >
              Use Insecure Connection?
            </Tooltip>
          }
        />
      </ProForm.Group>
    </Card>
  );
};

export default DockerAdvancedConnectionCard;

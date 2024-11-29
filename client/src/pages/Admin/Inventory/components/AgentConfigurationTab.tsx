import AgentInstallMethod from '@/components/DeviceConfiguration/AgentInstallMethod';
import { GrommetIconsInstall } from '@/components/Icons/CustomIcons';
import { updateAgentInstallMethod } from '@/services/rest/device';
import { InfoCircleFilled } from '@ant-design/icons';
import { ProForm, ProFormDependency } from '@ant-design/pro-components';
import { Alert, Avatar, Card, Col, message, Row, Space, Tag } from 'antd';
import React from 'react';
import { API, SsmAgent } from 'ssm-shared-lib';

export type AgentConfigurationTabProps = {
  device: Partial<API.DeviceItem>;
};

const AgentConfigurationTab: React.FC<AgentConfigurationTabProps> = ({
  device,
}) => {
  return (
    <ProForm
      submitter={{
        // eslint-disable-next-line @typescript-eslint/no-shadow
        render: (props, doms) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <Space direction="horizontal" size="middle">
                {doms}
              </Space>
            </div>
          );
        },
      }}
      onFinish={async (values) =>
        await updateAgentInstallMethod(
          device.uuid as string,
          values.installMethod,
        ).then(() => {
          message.success({ content: 'Configuration updated', duration: 6 });
        })
      }
    >
      {device && device.agentType && (
        <Card
          type="inner"
          title={
            <Row>
              <Col>
                <Avatar
                  style={{ backgroundColor: '#36aa40' }}
                  shape="square"
                  icon={<InfoCircleFilled />}
                />
              </Col>
              <Col
                style={{
                  marginLeft: 10,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
              >
                Agent Info
              </Col>
            </Row>
          }
          style={{ marginBottom: 10 }}
          styles={{
            header: { height: 55, minHeight: 55, paddingLeft: 15 },
            body: { paddingBottom: 0 },
          }}
        >
          <Space style={{ marginBottom: 10 }}>
            <>
              Agent Type:{' '}
              <Tag>
                {device.agentType === SsmAgent.InstallMethods.DOCKER
                  ? 'Docker'
                  : 'NodeJS'}
              </Tag>
            </>
            <>
              Agent Version: <Tag>{device.agentVersion}</Tag>
            </>
          </Space>
        </Card>
      )}
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#636536' }}
                shape="square"
                icon={<GrommetIconsInstall />}
              />
            </Col>
            <Col
              style={{
                marginLeft: 10,
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Agent installation method
            </Col>
          </Row>
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 55, minHeight: 55, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
      >
        <ProFormDependency name={['installMethod']} shouldUpdate>
          {({ installMethod }) => {
            if (installMethod !== device.agentType) {
              return (
                <Alert
                  style={{ marginBottom: 10 }}
                  showIcon
                  type={'warning'}
                  message={
                    'Before changing the install method, ensure that the agent is fully uninstalled.'
                  }
                />
              );
            }
          }}
        </ProFormDependency>
        {device && (
          <AgentInstallMethod
            initialValue={device.agentType as SsmAgent.InstallMethods}
          />
        )}
      </Card>
    </ProForm>
  );
};

export default AgentConfigurationTab;

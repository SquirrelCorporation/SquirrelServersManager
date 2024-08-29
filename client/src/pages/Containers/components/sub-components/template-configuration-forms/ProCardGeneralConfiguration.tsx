import {
  Bridge,
  ContainerSolid,
  GrommetIconsHost,
} from '@/components/Icons/CustomIcons';
import { BarsOutlined } from '@ant-design/icons';
import {
  CheckCard,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Avatar, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const ProCardGeneralConfiguration: React.FC<{ template: API.Template }> = (
  props,
) => {
  return (
    <ProCard
      title={
        <>
          <BarsOutlined /> General
        </>
      }
      direction="column"
      collapsible
      defaultCollapsed
      size={'small'}
    >
      <ProForm.Group direction={'horizontal'}>
        <ProFormText
          name="name"
          label="Name"
          initialValue={props.template.name}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="restart_policy"
          label="Restart Policy"
          initialValue={props.template.restart_policy}
          options={[
            { label: 'unless-stopped', value: 'unless-stopped' },
            { label: 'on-failure', value: 'on-failure' },
            { label: 'always', value: 'always' },
            { label: 'never', value: 'never' },
          ]}
        />
      </ProForm.Group>
      <ProForm.Item
        name="network"
        label="Network Mode"
        style={{ height: '100%' }}
      >
        <CheckCard.Group
          style={{ width: '100%' }}
          defaultValue={props.template.network || 'docker'}
        >
          <CheckCard
            title="Host Network"
            size={'small'}
            avatar={<Avatar src={<GrommetIconsHost />} size="small" />}
            description={
              <Typography.Text
                style={{
                  fontSize: 'x-small',
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                Same as host. No isolation. ex: 127.0.0.1
              </Typography.Text>
            }
            value="host"
          />
          <CheckCard
            size={'small'}
            title="Bridge Network"
            avatar={<Avatar src={<Bridge />} size="small" />}
            value="bridge"
            description={
              <Typography.Text
                style={{
                  fontSize: 'x-small',
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                Containers can communicate with names.
              </Typography.Text>
            }
          />
          <CheckCard
            defaultChecked
            size={'small'}
            title="Docker Network"
            avatar={<Avatar src={<ContainerSolid />} size="small" />}
            description={
              <Typography.Text
                style={{
                  fontSize: 'x-small',
                  color: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                Isolated on the docker network. ex: 172.0.34.2
              </Typography.Text>
            }
            value="docker"
          />
        </CheckCard.Group>
      </ProForm.Item>
    </ProCard>
  );
};

export default ProCardGeneralConfiguration;

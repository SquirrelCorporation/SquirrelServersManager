import {
  Bridge,
  ContainerSolid,
  GrommetIconsHost,
} from '@/components/Icons/CustomIcons';
import { CheckCard } from '@ant-design/pro-components';
import { Avatar, Typography } from 'antd';
import React from 'react';

export type NetworkTypesProps = {
  network?: string;
};

const NetworkTypes: React.FC<NetworkTypesProps> = ({ network }) => (
  <CheckCard.Group style={{ width: '100%' }} defaultValue={network || 'docker'}>
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
);

export default NetworkTypes;

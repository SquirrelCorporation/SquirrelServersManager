import { CardHeader } from '@/components/Template/CardHeader';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Card, Space } from 'antd';
import React, { useState } from 'react';
import Cron from 'react-js-cron';
import { API } from 'ssm-shared-lib';

interface DockerWatcherCronsCardProps {
  device: Partial<API.DeviceItem>;
}

const DockerWatcherCronsCard: React.FC<DockerWatcherCronsCardProps> = ({
  device,
}) => {
  const [dockerWatcherCron, setDockerWatcherCron] = useState<
    string | undefined
  >(device.configuration?.containers?.docker?.watchContainersCron);
  const [dockerStatsCron, setDockerStatsCron] = useState<string | undefined>(
    device.configuration?.containers?.docker?.watchContainersStatsCron,
  );

  return (
    <Card
      type="inner"
      title={
        <CardHeader
          title={'Watcher Crons'}
          color={'#3c8036'}
          icon={<FieldTimeOutlined />}
        />
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 45, minHeight: 45, paddingLeft: 15 },
        body: { paddingBottom: 0 },
      }}
    >
      Watch Containers:{' '}
      <Space
        direction={'horizontal'}
        style={{ width: '100%', marginTop: '5px', marginLeft: '10px' }}
      >
        <Cron
          value={dockerWatcherCron || ''}
          setValue={setDockerWatcherCron}
          clearButton={false}
        />
      </Space>
      Watch Containers Stats:
      <Space
        direction={'horizontal'}
        style={{ width: '100%', marginTop: '5px', marginLeft: '10px' }}
      >
        <Cron
          value={dockerStatsCron || ''}
          setValue={setDockerStatsCron}
          clearButton={false}
        />
      </Space>
    </Card>
  );
};

export default DockerWatcherCronsCard;

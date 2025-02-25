import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceProxmoxConfiguration } from '@/services/rest/device';
import { FieldTimeOutlined } from '@ant-design/icons';
import { Card, message, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import Cron from 'react-js-cron';
import { API } from 'ssm-shared-lib';

interface ProxmoxWatcherCronsCardProps {
  device: Partial<API.DeviceItem>;
}

const ProxmoxWatcherCronsCard: React.FC<ProxmoxWatcherCronsCardProps> = ({
  device,
}) => {
  const [watcherCron, setWatcherCron] = useState<string>(
    device.configuration?.containers?.proxmox?.watchContainersCron ||
      '*/1 * * * *',
  );
  const handleOnChangeEventsWatcher = async () => {
    if (device.uuid) {
      await updateDeviceProxmoxConfiguration(device.uuid, {
        watchContainersCron: watcherCron,
      }).then(() => {
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };
  useEffect(() => {
    if (
      watcherCron !==
      device.configuration?.containers.proxmox?.watchContainersCron
    ) {
      void handleOnChangeEventsWatcher();
    }
  }, [watcherCron]);

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
          value={watcherCron || ''}
          setValue={setWatcherCron}
          clearButton={false}
        />
      </Space>
    </Card>
  );
};

export default ProxmoxWatcherCronsCard;

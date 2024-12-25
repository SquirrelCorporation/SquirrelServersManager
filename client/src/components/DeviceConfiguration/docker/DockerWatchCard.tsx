import { EosIconsCronjob } from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceDockerConfiguration } from '@/services/rest/device';
import { InfoCircleFilled } from '@ant-design/icons';
import { ProForm, ProFormSwitch } from '@ant-design/pro-components';
import { Card, message, Tooltip } from 'antd';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

interface DockerWatchCardProps {
  device: Partial<API.DeviceItem>;
}

const DockerWatchCard = ({ device }: DockerWatchCardProps) => {
  const [dockerWatcher, setDockerWatcher] = useState<boolean>(
    device.dockerWatcher === undefined ? true : device.dockerWatcher,
  );
  const [dockerEventsWatcher, setDockerEventsWatcher] = useState<boolean>(
    device.dockerEventsWatcher === undefined
      ? true
      : device.dockerEventsWatcher,
  );
  const [dockerStatsWatcher, setDockerStatsWatcher] = useState<boolean>(
    device.dockerStatsWatcher === undefined ? true : device.dockerStatsWatcher,
  );

  const handleOnChangeDockerWatcher = async () => {
    if (device.uuid) {
      await updateDeviceDockerConfiguration(device.uuid, {
        dockerWatcher: !dockerWatcher,
        dockerStatsWatcher: dockerStatsWatcher,
        dockerEventsWatcher: dockerEventsWatcher,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  const handleOnChangeStatsWatcher = async () => {
    if (device.uuid) {
      await updateDeviceDockerConfiguration(device.uuid, {
        dockerWatcher: dockerWatcher,
        dockerStatsWatcher: !dockerStatsWatcher,
        dockerEventsWatcher: dockerEventsWatcher,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  const handleOnChangeEventsWatcher = async () => {
    if (device.uuid) {
      await updateDeviceDockerConfiguration(device.uuid, {
        dockerWatcher: dockerWatcher,
        dockerStatsWatcher: dockerStatsWatcher,
        dockerEventsWatcher: !dockerEventsWatcher,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  return (
    <Card
      type="inner"
      title={
        <CardHeader
          title={'Watch'}
          color={'#4d329f'}
          icon={<EosIconsCronjob />}
        />
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 45, minHeight: 45, paddingLeft: 15 },
        body: { paddingBottom: 0 },
      }}
      extra={
        <Tooltip title="Activate or deactivate cronjobs on this device.">
          <InfoCircleFilled />
        </Tooltip>
      }
    >
      <ProForm.Group>
        <ProFormSwitch
          checkedChildren={'Watch Containers'}
          unCheckedChildren={'Containers not watched'}
          fieldProps={{
            value: dockerWatcher,
            onChange: handleOnChangeDockerWatcher,
          }}
        />
        <ProFormSwitch
          checkedChildren={'Watch Containers Stats'}
          unCheckedChildren={'Containers stats not watched'}
          fieldProps={{
            value: dockerStatsWatcher,
            onChange: handleOnChangeStatsWatcher,
          }}
        />
        <ProFormSwitch
          checkedChildren={'Watch Container Events'}
          unCheckedChildren={'Containers events not watched'}
          fieldProps={{
            value: dockerEventsWatcher,
            onChange: handleOnChangeEventsWatcher,
          }}
        />
      </ProForm.Group>
    </Card>
  );
};

export default DockerWatchCard;

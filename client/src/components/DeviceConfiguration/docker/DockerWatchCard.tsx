import { EosIconsCronjob } from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceDockerConfiguration } from '@/services/rest/devices/devices';
import { InfoCircleFilled } from '@ant-design/icons';
import { ProForm, ProFormSwitch } from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import { Card, Tooltip } from 'antd';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

interface DockerWatchCardProps {
  device: Partial<API.DeviceItem>;
  showAdvanced: boolean;
}

const DockerWatchCard: React.FC<DockerWatchCardProps> = ({
  device,
  showAdvanced,
}) => {
  const [dockerWatcher, setDockerWatcher] = useState<boolean>(
    device.configuration?.containers?.docker?.watchContainers ?? true,
  );
  const [dockerEventsWatcher, setDockerEventsWatcher] = useState<boolean>(
    device.configuration?.containers?.docker?.watchEvents ?? true,
  );
  const [dockerStatsWatcher, setDockerStatsWatcher] = useState<boolean>(
    device.configuration?.containers?.docker?.watchContainersStats ?? true,
  );
  const [dockerWatchAll, setDockerWatchAll] = useState<boolean>(
    device.configuration?.containers?.docker?.watchAll ?? true,
  );

  const handleOnChangeDockerWatchAll = async () => {
    if (device.uuid) {
      await updateDeviceDockerConfiguration(device.uuid, {
        dockerWatcher: dockerWatcher,
        dockerStatsWatcher: dockerStatsWatcher,
        dockerEventsWatcher: dockerEventsWatcher,
        dockerWatchAll: !dockerWatchAll,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        setDockerWatchAll(response.data.dockerWatchAll);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  const handleOnChangeDockerWatcher = async () => {
    if (device.uuid) {
      await updateDeviceDockerConfiguration(device.uuid, {
        dockerWatcher: !dockerWatcher,
        dockerStatsWatcher: dockerStatsWatcher,
        dockerEventsWatcher: dockerEventsWatcher,
        dockerWatchAll: dockerWatchAll,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        setDockerWatchAll(response.data.dockerWatchAll);
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
        dockerWatchAll: dockerWatchAll,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        setDockerWatchAll(response.data.dockerWatchAll);
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
        dockerWatchAll: dockerWatchAll,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        setDockerWatchAll(response.data.dockerWatchAll);
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
        <InfoLinkWidget
          tooltipTitle="Activate or deactivate the cronjobs on this device."
          documentationLink="https://squirrelserversmanager.io/docs/user-guides/devices/configuration/docker#watch-settings"
        />
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
          checkedChildren={'Watch Containers Events'}
          unCheckedChildren={'Containers events not watched'}
          fieldProps={{
            value: dockerEventsWatcher,
            onChange: handleOnChangeEventsWatcher,
          }}
        />
      </ProForm.Group>
      {showAdvanced && (
        <ProForm.Group>
          <ProFormSwitch
            checkedChildren={'Watch All Containers'}
            unCheckedChildren={'Watch Only Running Containers'}
            fieldProps={{
              value: dockerWatchAll,
              onChange: handleOnChangeDockerWatchAll,
            }}
          />
        </ProForm.Group>
      )}
    </Card>
  );
};

export default DockerWatchCard;

import { Linuxcontainers, Proxmox } from '@shared/ui/icons/categories/services';
import DockerConfigurationForm from '@/pages/Admin/Inventory/components/tabs/containers/DockerConfigurationForm';
import ProxmoxConfigurationForm from '@/pages/Admin/Inventory/components/tabs/containers/ProxmoxConfigurationForm';
import { DockerOutlined } from '@ant-design/icons';
import { Card, Col, Row, Segmented, Tabs } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type ContainersConfigurationTabProps = {
  device: Partial<API.DeviceItem>;
};

const ContainersConfigurationTab: React.FC<ContainersConfigurationTabProps> = ({
  device,
}) => {
  const [selectedKey, setSelectedKey] = React.useState<string>('docker');
  const onChange = (e: string) => {
    setSelectedKey(e);
  };

  return (
    <>
      <Tabs
        items={[
          { label: 'Docker', key: 'docker', icon: <DockerOutlined /> },
          { label: 'Proxmox', key: 'proxmox', icon: <Proxmox /> },
          {
            label: 'LXD',
            key: 'lxd',
            icon: <Linuxcontainers />,
            disabled: true,
          },
        ]}
        onChange={onChange}
        tabBarStyle={{
          width: '100%',
          padding: 0,
          margin: 0,
          borderBottom: 'none',
        }}
        style={{
          width: '100%',
          padding: 0,
          margin: 0,
          borderBottom: 'none',
          borderTop: 'none',
        }}
      />
      {selectedKey === 'docker' && <DockerConfigurationForm device={device} />}
      {selectedKey === 'proxmox' && (
        <ProxmoxConfigurationForm device={device} />
      )}
    </>
  );
};

export default ContainersConfigurationTab;

import { Linuxcontainers, Proxmox } from '@/components/Icons/CustomIcons';
import DockerConfigurationForm from '@/pages/Admin/Inventory/components/tabs/containers/DockerConfigurationForm';
import ProxmoxConfigurationForm from '@/pages/Admin/Inventory/components/tabs/containers/ProxmoxConfigurationForm';
import { DockerOutlined } from '@ant-design/icons';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Col, Row, Segmented } from 'antd';
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
    <Row>
      <Col span={4}>
        <Segmented
          style={{ marginRight: 10 }}
          onChange={onChange}
          vertical
          size="middle"
          defaultValue={'docker'}
          options={[
            { label: 'Docker', value: 'docker', icon: <DockerOutlined /> },
            { label: 'Proxmox', value: 'proxmox', icon: <Proxmox /> },
            {
              label: 'LXD',
              value: 'lxd',
              icon: <Linuxcontainers />,
              disabled: true,
            },
          ]}
          block
        />
      </Col>
      <Col span={20}>
        {selectedKey === 'docker' && (
          <DockerConfigurationForm device={device} />
        )}
        {selectedKey === 'proxmox' && (
          <ProxmoxConfigurationForm device={device} />
        )}
      </Col>
    </Row>
  );
};

export default ContainersConfigurationTab;

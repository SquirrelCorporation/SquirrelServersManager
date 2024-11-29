import AgentConfigurationTab from '@/pages/Admin/Inventory/components/AgentConfigurationTab';
import DiagnosticTab from '@/pages/Admin/Inventory/components/DiagnosticTab';
import DockerConfigurationForm from '@/pages/Admin/Inventory/components/DockerConfigurationForm';
import SSHConfigurationForm from '@/pages/Admin/Inventory/components/SSHConfigurationForm';
import { Modal, Tabs, TabsProps } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';
import { SsmStatus } from 'ssm-shared-lib';

export type ConfigurationModalProps = {
  updateModalOpen: boolean;
  handleUpdateModalOpen: any;
  device: Partial<API.DeviceItem>;
};

const ConfigurationModal: React.FC<ConfigurationModalProps> = (props) => {
  const { updateModalOpen, handleUpdateModalOpen, device } = props;
  const items: TabsProps['items'] = [
    {
      key: 'ssh',
      label: 'SSH',
      children: <SSHConfigurationForm values={device} />,
    },
    {
      key: 'docker',
      label: 'Docker',
      children: <DockerConfigurationForm device={device} />,
    },
    {
      key: 'diagnostic',
      label: 'Diagnostic',
      children: <DiagnosticTab device={device} />,
    },
    {
      key: 'agent',
      label: 'Agent',
      children: <AgentConfigurationTab device={device} />,
    },
  ];

  return (
    <Modal
      style={{ padding: '32px 40px 48px' }}
      width={1000}
      destroyOnClose
      title={`${device.hostname || 'Unknown device'} (${device.ip})`}
      open={updateModalOpen}
      onCancel={() => {
        handleUpdateModalOpen(false);
      }}
      footer={() => <div />}
    >
      <Tabs
        onChange={(key: string) => {
          console.log(key);
        }}
        type="card"
        items={
          device.status === SsmStatus.DeviceStatus.UNMANAGED
            ? items.filter((e) => e.key !== 'agent')
            : items
        }
      />
    </Modal>
  );
};

export default ConfigurationModal;

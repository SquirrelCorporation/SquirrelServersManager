import AgentConfigurationTab from '@/pages/Admin/Inventory/components/tabs/AgentConfigurationTab';
import ContainersConfigurationTab from '@/pages/Admin/Inventory/components/tabs/ContainersConfigurationTab';
import DiagnosticTab from '@/pages/Admin/Inventory/components/tabs/DiagnosticTab';
import SSHConfigurationFormTab from '@/pages/Admin/Inventory/components/tabs/SSHConfigurationFormTab';
import SystemInformationConfigurationTab from '@/pages/Admin/Inventory/components/tabs/SystemInformationConfigurationTab';
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
      children: <SSHConfigurationFormTab values={device} />,
    },
    {
      key: 'system-information',
      label: 'System Information',
      children: <SystemInformationConfigurationTab device={device} />,
    },
    {
      key: 'containers',
      label: 'Containers',
      children: <ContainersConfigurationTab device={device} />,
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

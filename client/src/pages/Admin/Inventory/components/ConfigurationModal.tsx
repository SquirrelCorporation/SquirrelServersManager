import AgentConfigurationTab from '@/pages/Admin/Inventory/components/tabs/AgentConfigurationTab';
import ContainersConfigurationTab from '@/pages/Admin/Inventory/components/tabs/ContainersConfigurationTab';
import DiagnosticTab from '@/pages/Admin/Inventory/components/tabs/DiagnosticTab';
import SSHConfigurationFormTab from '@/pages/Admin/Inventory/components/tabs/SSHConfigurationFormTab';
import SystemInformationConfigurationTab from '@/pages/Admin/Inventory/components/tabs/SystemInformationConfigurationTab';
import { Modal, TabsProps } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { API, SsmStatus } from 'ssm-shared-lib';
import { ModalStyledTabs } from '@shared/ui/layouts/StyledTabContainer';
import {
  StreamlineComputerConnection,
  GrommetIconsSystem,
} from '@shared/ui/icons/categories/system';
import {
  VaadinCubes,
} from '@shared/ui/icons/categories/containers';
import {
  MedicalSearchDiagnosisSolid,
  TablerPlugConnected,
} from '@shared/ui/icons/categories/actions';

export type ConfigurationModalProps = {
  updateModalOpen: boolean;
  handleUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
  device: Partial<API.DeviceItem>;
};

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  updateModalOpen,
  handleUpdateModalOpen,
  device,
}) => {
  const items: NonNullable<TabsProps['items']> = [
    {
      key: 'ssh',
      label: 'SSH',
      icon: <StreamlineComputerConnection />,
      children: <SSHConfigurationFormTab device={device} />,
    },
    {
      key: 'system-information',
      label: 'System Information',
      icon: <GrommetIconsSystem />,
      children: <SystemInformationConfigurationTab device={device} />,
    },
    {
      key: 'containers',
      label: 'Containers',
      icon: <VaadinCubes />,
      children: <ContainersConfigurationTab device={device} />,
    },
    {
      key: 'diagnostic',
      label: 'Diagnostic',
      icon: <MedicalSearchDiagnosisSolid />,
      children: <DiagnosticTab device={device} />,
    },
    {
      key: 'agent',
      label: 'Agent',
      icon: <TablerPlugConnected />,
      children: <AgentConfigurationTab device={device} />,
    },
  ];

  return (
    <Modal
      style={{ padding: '0px' }}
      width={1000}
      destroyOnClose
      title={`${device.hostname || 'Unknown device'} (${device.ip})`}
      open={updateModalOpen}
      onCancel={() => {
        handleUpdateModalOpen(false);
      }}
      footer={() => <div />}
    >
      <ModalStyledTabs
        onChange={(key: string) => {
          console.log(key);
        }}
        tabItems={
          device.status === SsmStatus.DeviceStatus.UNMANAGED
            ? items.filter((e) => e.key !== 'agent')
            : items
        }
      />
    </Modal>
  );
};

export default ConfigurationModal;

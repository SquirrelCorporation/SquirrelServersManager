import {
  CloudOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  LockOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  SyncOutlined,
  ToolOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Avatar, Button, List, Modal, Tabs, TabsProps } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { API } from 'ssm-shared-lib';

export interface DeviceManagementModalHandles {
  open: () => void;
}

type DeviceManagementModalProps = {
  onRunPlaybook: (playbook: string) => void;
  device: API.DeviceItem;
};

const DeviceManagementModal = React.forwardRef<
  DeviceManagementModalHandles,
  DeviceManagementModalProps
>(({ onRunPlaybook }, ref) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({ open }));

  // Playbooks data
  const playbooks = {
    housekeeping: [
      {
        key: 'cleanup-temp',
        title: 'Clean Temporary Files',
        description: 'Remove unused temporary files.',
        icon: <ToolOutlined />,
      },
      {
        key: 'clear-logs',
        title: 'Clear Log Files',
        description: 'Delete old log files to optimize performance.',
        icon: <WarningOutlined />,
      },
      {
        key: 'reclaim-space',
        title: 'Reclaim Disk Space',
        description: 'Free up extra disk space by removing unused files.',
        icon: <SyncOutlined />,
      },
    ],
    updates: [
      {
        key: 'os-updates',
        title: 'Apply OS Updates',
        description: 'Install the latest operating system updates.',
        icon: <SyncOutlined />,
      },
      {
        key: 'package-updates',
        title: 'Update Packages',
        description: 'Update all installed packages to the latest version.',
        icon: <PlayCircleOutlined />,
      },
    ],
    security: [
      {
        key: 'enable-firewall',
        title: 'Enable Firewall',
        description: 'Ensure a firewall is active and properly configured.',
        icon: <LockOutlined />,
      },
      {
        key: 'run-security-update',
        title: 'Run Security Updates',
        description: 'Update packages with known security vulnerabilities.',
        icon: <ToolOutlined />,
      },
      {
        key: 'disable-root-login',
        title: 'Disable Root Login',
        description: 'Enhance SSH security by disabling root login.',
        icon: <WarningOutlined />,
      },
    ],
    fqdn: [
      {
        key: 'change-fqdn',
        title: 'Change FQDN',
        description: 'Modify the Fully Qualified Domain Name of the system.',
        icon: <GlobalOutlined />,
      },
      {
        key: 'verify-fqdn',
        title: 'Verify FQDN',
        description: 'Ensure the FQDN is correctly configured.',
        icon: <SyncOutlined />,
      },
    ],
    performance: [
      {
        key: 'optimize-cpu',
        title: 'Optimize CPU Performance',
        description: 'Adjust CPU frequency for better performance.',
        icon: <CloudOutlined />,
      },
      {
        key: 'optimize-memory',
        title: 'Optimize Memory Usage',
        description: 'Analyze and optimize memory utilization.',
        icon: <DatabaseOutlined />,
      },
      {
        key: 'clear-cache',
        title: 'Clear Cache',
        description: 'Free up memory by clearing unused cache.',
        icon: <ToolOutlined />,
      },
    ],
    diagnostics: [
      {
        key: 'check-disk',
        title: 'Check Disk Usage',
        description: 'Analyze the disk usage and identify performance issues.',
        icon: <WarningOutlined />,
      },
      {
        key: 'check-cpu',
        title: 'Check CPU Load',
        description: 'Retrieve current CPU load and performance parameters.',
        icon: <PlayCircleOutlined />,
      },
      {
        key: 'check-memory',
        title: 'Check Memory Usage',
        description: 'Run diagnostics to analyze memory utilization.',
        icon: <DatabaseOutlined />,
      },
    ],
    backup: [
      {
        key: 'create-backup',
        title: 'Backup Critical Files',
        description: 'Backup important directories and configuration files.',
        icon: <CloudOutlined />,
      },
      {
        key: 'restore-backup',
        title: 'Restore Backup',
        description: 'Restore the system from a previous backup.',
        icon: <SyncOutlined />,
      },
      {
        key: 'verify-backup',
        title: 'Verify Backup Integrity',
        description: 'Test the integrity of existing backups.',
        icon: <ToolOutlined />,
      },
    ],
    userManagement: [
      {
        key: 'create-user',
        title: 'Create User Account',
        description: 'Add new user accounts with specified roles.',
        icon: <UserOutlined />,
      },
      {
        key: 'delete-inactive',
        title: 'Delete Inactive Users',
        description: 'Remove users who have not logged in recently.',
        icon: <WarningOutlined />,
      },
      {
        key: 'manage-ssh-keys',
        title: 'Manage SSH Keys',
        description: 'Add, remove, or rotate user SSH keys.',
        icon: <LockOutlined />,
      },
    ],
    appManagement: [
      {
        key: 'deploy-webserver',
        title: 'Deploy Web Server',
        description: 'Install and configure Nginx or Apache.',
        icon: <GlobalOutlined />,
      },
      {
        key: 'install-app',
        title: 'Install Application',
        description: 'Install a specific package or application.',
        icon: <PlayCircleOutlined />,
      },
      {
        key: 'update-apps',
        title: 'Update Applications',
        description: 'Update all currently installed applications.',
        icon: <SyncOutlined />,
      },
    ],
    containers: [
      {
        key: 'deploy-docker',
        title: 'Deploy Docker',
        description: 'Install and configure Docker on the system.',
        icon: <ContainerOutlined />,
      },
      {
        key: 'launch-containers',
        title: 'Launch Containers',
        description: 'Run Docker containers from prebuilt images.',
        icon: <PlayCircleOutlined />,
      },
      {
        key: 'remove-unused-containers',
        title: 'Remove Stale Containers',
        description: 'Clean up unused or inactive Docker containers.',
        icon: <WarningOutlined />,
      },
    ],
  };

  // Render a list of playbooks for a category
  const renderPlaybookList = (playbookList: typeof playbooks.housekeeping) => (
    <List
      dataSource={playbookList}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key="run"
              type="primary"
              onClick={() => onRunPlaybook(item.key)}
            >
              Run
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar size="large" icon={item.icon} />}
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );

  // Tabs configuration
  const items: TabsProps['items'] = [
    {
      key: 'housekeeping',
      label: 'Housekeeping',
      icon: <ToolOutlined />,
      children: renderPlaybookList(playbooks.housekeeping),
    },
    {
      key: 'updates',
      label: 'Updates',
      icon: <SyncOutlined />,
      children: renderPlaybookList(playbooks.updates),
    },
    {
      key: 'security',
      label: 'Security',
      icon: <LockOutlined />,
      children: renderPlaybookList(playbooks.security),
    },
    {
      key: 'fqdn',
      label: 'FQDN',
      icon: <GlobalOutlined />,
      children: renderPlaybookList(playbooks.fqdn),
    },
    {
      key: 'performance',
      label: 'Performance',
      icon: <CloudOutlined />,
      children: renderPlaybookList(playbooks.performance),
    },
    {
      key: 'diagnostics',
      label: 'Diagnostics',
      icon: <WarningOutlined />,
      children: renderPlaybookList(playbooks.diagnostics),
    },
    {
      key: 'backup',
      label: 'Backup',
      icon: <CloudOutlined />,
      children: renderPlaybookList(playbooks.backup),
    },
    {
      key: 'userManagement',
      label: 'User Management',
      icon: <UserOutlined />,
      children: renderPlaybookList(playbooks.userManagement),
    },
    {
      key: 'appManagement',
      label: 'App Management',
      icon: <SettingOutlined />,
      children: renderPlaybookList(playbooks.appManagement),
    },
    {
      key: 'containers',
      label: 'Containers',
      icon: <ContainerOutlined />,
      children: renderPlaybookList(playbooks.containers),
    },
  ];

  return (
    <Modal
      title="Device Management"
      open={visible}
      onCancel={close}
      footer={null}
      width={800}
    >
      <Tabs items={items} />
    </Modal>
  );
});

export default DeviceManagementModal;

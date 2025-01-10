import { FileTree } from '@/components/Icons/CustomIcons';
import {
  BugOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ShakeOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import React from 'react';

export enum Types {
  PLAYBOOK = 'playbook',
  PLAYBOOK_SELECTION = 'playbook-selection',
  ACTION = 'action',
  DIVIDER = 'divider',
  SUBMENU = 'submenu',
}

export type QuickActionReferenceType = {
  type: Types;
  action?: string;
  playbookQuickRef?: string;
  label?: React.ReactNode;
  onAdvancedMenu: boolean;
  children?: QuickActionReferenceType[];
  icon?: React.ReactNode;
  needConfirmation?: boolean;
};

export enum Actions {
  CONNECT = 'connect',
  DELETE = 'delete',
  BROWSE_FILES = 'browseFiles',
}

const DeviceQuickActionReference: QuickActionReferenceType[] = [
  {
    type: Types.PLAYBOOK_SELECTION,
    icon: <PlayCircleOutlined />,
    label: 'Execute a playbook',
    onAdvancedMenu: false,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'reboot',
    icon: <ReloadOutlined />,
    label: 'Reboot',
    onAdvancedMenu: false,
    needConfirmation: true,
  },
  {
    type: Types.ACTION,
    action: Actions.CONNECT,
    icon: <LoginOutlined />,
    label: 'Connect',
    onAdvancedMenu: false,
  },
  {
    type: Types.ACTION,
    action: Actions.BROWSE_FILES,
    icon: <FileTree />,
    label: 'Browse files',
    onAdvancedMenu: false,
  },
  {
    onAdvancedMenu: false,
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'ping',
    icon: <ShakeOutlined />,
    label: 'Ping',
    onAdvancedMenu: false,
  },
  {
    onAdvancedMenu: true,
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'updateAgent',
    onAdvancedMenu: true,
    icon: <ToTopOutlined />,
    label: 'Update Agent',
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'reinstallAgent',
    onAdvancedMenu: true,
    icon: <DownloadOutlined />,
    label: 'Reinstall Agent',
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'restartAgent',
    onAdvancedMenu: true,
    icon: <ThunderboltOutlined />,
    label: 'Restart Agent',
  },
  {
    type: Types.PLAYBOOK,
    onAdvancedMenu: true,
    playbookQuickRef: 'retrieveAgentLogs',
    icon: <BugOutlined />,
    label: 'Retrieve Agent Logs',
  },
  {
    onAdvancedMenu: true,
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'uninstallAgent',
    onAdvancedMenu: true,
    icon: <DeleteOutlined />,
    label: 'Uninstall Agent',
  },
  {
    type: Types.ACTION,
    action: Actions.DELETE,
    onAdvancedMenu: true,
    icon: <DeleteOutlined />,
    label: 'Delete device',
  },
];

export default DeviceQuickActionReference;

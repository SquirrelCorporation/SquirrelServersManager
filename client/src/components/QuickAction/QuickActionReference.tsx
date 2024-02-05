import {
  BugOutlined,
  DownloadOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ShakeOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import React from 'react';

export type QuickActionReferenceType = {
  type: string;
  action?: string;
  playbookFile?: string;
  label?: React.JSX.Element;
  onAdvancedMenu: boolean;
};

export enum Actions {
  CONNECT = 'connect',
}

export enum Types {
  PLAYBOOK = 'playbook',
  PLAYBOOK_SELECTION = 'playbook-selection',
  ACTION = 'action',
}

const QuickActionReference: QuickActionReferenceType[] = [
  {
    type: 'playbook-selection',
    label: (
      <>
        <PlayCircleOutlined /> Execute a playbook
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    type: 'playbook',
    playbookFile: '_reboot',
    label: (
      <>
        <ReloadOutlined /> Reboot
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    type: 'action',
    action: Actions.CONNECT,
    label: (
      <>
        <LoginOutlined /> Connect
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    onAdvancedMenu: false,
    type: 'divider',
  },
  {
    type: 'playbook',
    playbookFile: '_ping',
    label: (
      <>
        <ShakeOutlined /> Ping
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    onAdvancedMenu: true,
    type: 'divider',
  },
  {
    type: 'playbook',
    playbookFile: '_updateAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <ToTopOutlined /> Update Agent
      </>
    ),
  },
  {
    type: 'playbook',
    playbookFile: '_reinstallAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <DownloadOutlined /> Reinstall Agent
      </>
    ),
  },
  {
    type: 'playbook',
    playbookFile: '_restartAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <ThunderboltOutlined /> Restart Agent
      </>
    ),
  },
  {
    type: 'action',
    onAdvancedMenu: true,
    label: (
      <>
        <BugOutlined /> Retrieve Agent Logs
      </>
    ),
  },
];

export default QuickActionReference;

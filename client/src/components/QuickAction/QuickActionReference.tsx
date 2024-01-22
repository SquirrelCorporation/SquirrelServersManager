import { MenuProps } from 'antd';
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
  playbookFile?: string;
  label: React.JSX.Element;
  onAdvancedMenu: boolean;
};

const QuickActionReference : QuickActionReferenceType[] = [
  {
    type: 'action',
    label: (
      <>
        <PlayCircleOutlined /> Execute a playbook
      </>
    ),
    onAdvancedMenu: false
  },
  {
    // 0 Reboot
    type: 'playbook',
    playbookFile: '_reboot',
    label: (
      <>
        <ReloadOutlined /> Reboot
      </>
    ),
    onAdvancedMenu: false
  },
  {
    // 1 Connect
    type: 'action',
    label: (
      <>
        <LoginOutlined /> Connect
      </>
    ),
    onAdvancedMenu: false
  },
  {
    onAdvancedMenu: false,
    type: 'divider',
  },
  {
    // 3 ping
    type: 'playbook',
    playbookFile: '_ping',
    label: (
      <>
        <ShakeOutlined /> Ping
      </>
    ),
    onAdvancedMenu: false
  },
  {
    onAdvancedMenu: true,
    type: 'divider',
  },
  {
    // 5 Update Agent
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
    // 6 Reinstall Agent
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
    // 7 Restart Agent
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
    // 8  Agent Log
    type: 'action',
    onAdvancedMenu: true,
    label: (
      <>
        <BugOutlined /> Retrieve Agent Logs
      </>
    ),
  },
]

export default QuickActionReference;

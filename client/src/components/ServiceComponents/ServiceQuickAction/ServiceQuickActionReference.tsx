import {
  BugOutlined,
  DeleteOutlined,
  LoginOutlined,
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

export type ServiceQuickActionReferenceType = {
  type: Types;
  action?: string;
  playbookFile?: string;
  label?: React.JSX.Element;
  children?: ServiceQuickActionReferenceType[];
};

export enum Actions {
  CONNECT = 'connect',
  DELETE = 'delete',
}

const ServiceQuickActionReference: ServiceQuickActionReferenceType[] = [
  {
    type: Types.ACTION,
    action: Actions.CONNECT,
    label: (
      <>
        <LoginOutlined /> Exec
      </>
    ),
  },
  {
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookFile: '_ping',
    label: (
      <>
        <ShakeOutlined /> Ping
      </>
    ),
  },
  {
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookFile: '_updateAgent',
    label: (
      <>
        <ToTopOutlined /> Update Service
      </>
    ),
  },
  {
    type: Types.PLAYBOOK,
    playbookFile: '_restartAgent',
    label: (
      <>
        <ThunderboltOutlined /> Restart Service
      </>
    ),
  },
  {
    type: Types.PLAYBOOK,
    playbookFile: '_retrieveAgentLogs',
    label: (
      <>
        <BugOutlined /> Service Logs
      </>
    ),
  },
  {
    type: Types.DIVIDER,
  },
  {
    type: Types.ACTION,
    action: Actions.DELETE,
    label: (
      <>
        <DeleteOutlined /> Delete Service
      </>
    ),
  },
];

export default ServiceQuickActionReference;

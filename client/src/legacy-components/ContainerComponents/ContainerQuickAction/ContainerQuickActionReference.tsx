import { Live24Filled } from '@/components/Icons/CustomIcons';
import {
  CloseCircleOutlined,
  EditOutlined,
  PauseOutlined,
  PlayCircleFilled,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import React from 'react';
import { SsmContainer } from 'ssm-shared-lib';

export enum ServiceQuickActionReferenceTypes {
  ACTION = 'action',
  DIVIDER = 'divider',
  SUBMENU = 'submenu',
}

export type ContainerQuickActionReferenceType = {
  type: ServiceQuickActionReferenceTypes;
  action?: ServiceQuickActionReferenceActions | SsmContainer.Actions;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  children?: ContainerQuickActionReferenceType[];
  supportedBy: SsmContainer.ContainerTypes[];
};

export enum ServiceQuickActionReferenceActions {
  RENAME = 'rename',
  LIVE_LOGS = 'logs',
}

const ContainerQuickActionReference: ContainerQuickActionReferenceType[] = [
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: ServiceQuickActionReferenceActions.LIVE_LOGS,
    icon: <Live24Filled />,
    label: 'Live Logs',
    supportedBy: [SsmContainer.ContainerTypes.DOCKER],
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: ServiceQuickActionReferenceActions.RENAME,
    icon: <EditOutlined />,
    label: 'Rename',
    supportedBy: [SsmContainer.ContainerTypes.DOCKER],
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.STOP,
    icon: <StopOutlined />,
    label: 'Stop',
    supportedBy: [
      SsmContainer.ContainerTypes.DOCKER,
      SsmContainer.ContainerTypes.PROXMOX,
    ],
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.START,
    icon: <PlayCircleFilled />,
    label: 'Start',
    supportedBy: [
      SsmContainer.ContainerTypes.DOCKER,
      SsmContainer.ContainerTypes.PROXMOX,
    ],
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.RESTART,
    icon: <SwapOutlined />,
    label: 'Restart',
    supportedBy: [
      SsmContainer.ContainerTypes.DOCKER,
      SsmContainer.ContainerTypes.PROXMOX,
    ],
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.PAUSE,
    icon: <PauseOutlined />,
    label: 'Pause',
    supportedBy: [
      SsmContainer.ContainerTypes.DOCKER,
      SsmContainer.ContainerTypes.PROXMOX,
    ],
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.KILL,
    icon: <CloseCircleOutlined />,
    label: 'Kill',
    supportedBy: [
      SsmContainer.ContainerTypes.DOCKER,
      SsmContainer.ContainerTypes.PROXMOX,
    ],
  },
];

export default ContainerQuickActionReference;

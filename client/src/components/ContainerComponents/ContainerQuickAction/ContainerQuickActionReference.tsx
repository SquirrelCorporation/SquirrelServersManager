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
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: ServiceQuickActionReferenceActions.RENAME,
    icon: <EditOutlined />,
    label: 'Rename',
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.STOP,
    icon: <StopOutlined />,
    label: 'Stop',
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.START,
    icon: <PlayCircleFilled />,
    label: 'Start',
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.RESTART,
    icon: <SwapOutlined />,
    label: 'Restart',
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.PAUSE,
    icon: <PauseOutlined />,
    label: 'Pause',
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.KILL,
    icon: <CloseCircleOutlined />,
    label: 'Kill',
  },
];

export default ContainerQuickActionReference;

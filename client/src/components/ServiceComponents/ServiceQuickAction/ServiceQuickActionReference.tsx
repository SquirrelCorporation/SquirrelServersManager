import { Live24Filled } from '@/components/Icons/CustomIcons';
import {
  CloseCircleOutlined,
  EditOutlined,
  PauseOutlined,
  PlayCircleFilled,
  StopFilled,
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

export type ServiceQuickActionReferenceType = {
  type: ServiceQuickActionReferenceTypes;
  action?: ServiceQuickActionReferenceActions | SsmContainer.Actions;
  label?: React.JSX.Element;
  children?: ServiceQuickActionReferenceType[];
};

export enum ServiceQuickActionReferenceActions {
  RENAME = 'rename',
  LIVE_LOGS = 'logs',
}

const ServiceQuickActionReference: ServiceQuickActionReferenceType[] = [
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: ServiceQuickActionReferenceActions.LIVE_LOGS,
    label: (
      <>
        <Live24Filled /> Live Logs
      </>
    ),
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: ServiceQuickActionReferenceActions.RENAME,
    label: (
      <>
        <EditOutlined /> Rename
      </>
    ),
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.STOP,
    label: (
      <>
        <StopOutlined /> Stop
      </>
    ),
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.START,
    label: (
      <>
        <PlayCircleFilled /> Start
      </>
    ),
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.RESTART,
    label: (
      <>
        <SwapOutlined /> Restart
      </>
    ),
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.PAUSE,
    label: (
      <>
        <PauseOutlined /> Pause
      </>
    ),
  },
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: SsmContainer.Actions.KILL,
    label: (
      <>
        <CloseCircleOutlined /> Kill
      </>
    ),
  },
];

export default ServiceQuickActionReference;

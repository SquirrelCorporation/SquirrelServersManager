import {
  BugOutlined,
  DeleteOutlined,
  EditOutlined,
  LoginOutlined,
  ShakeOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import React from 'react';

export enum ServiceQuickActionReferenceTypes {
  ACTION = 'action',
  DIVIDER = 'divider',
  SUBMENU = 'submenu',
}

export type ServiceQuickActionReferenceType = {
  type: ServiceQuickActionReferenceTypes;
  action?: string;
  label?: React.JSX.Element;
  children?: ServiceQuickActionReferenceType[];
};

export enum ServiceQuickActionReferenceActions {
  RENAME = 'rename',
}

const ServiceQuickActionReference: ServiceQuickActionReferenceType[] = [
  {
    type: ServiceQuickActionReferenceTypes.ACTION,
    action: ServiceQuickActionReferenceActions.RENAME,
    label: (
      <>
        <EditOutlined /> Rename
      </>
    ),
  },
];

export default ServiceQuickActionReference;

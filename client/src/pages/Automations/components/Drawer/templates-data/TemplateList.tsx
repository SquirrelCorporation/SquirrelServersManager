import { Types } from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionReference';
import { FluentMdl2FileTemplate } from '@/components/Icons/CustomIcons';
import { ItemType } from 'rc-menu/es/interface';
import React from 'react';

const items: ItemType[] = [
  {
    key: '0',
    label: (
      <>
        <FluentMdl2FileTemplate /> Update some devices every month
      </>
    ),
  },
  {
    key: '1',
    label: (
      <>
        <FluentMdl2FileTemplate /> Reboot some devices every day
      </>
    ),
  },
  {
    type: Types.DIVIDER,
  },
  {
    key: '2',
    label: (
      <>
        <FluentMdl2FileTemplate /> Restart some containers every day
      </>
    ),
  },
];

export default items;

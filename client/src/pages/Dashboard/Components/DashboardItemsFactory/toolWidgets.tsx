/**
 * Tool and Utility Widget Definitions
 */

import React from 'react';
import AnsiblePlaybookRunner from '../AnsiblePlaybookRunner';
import ContainerUpdateCenter from '../ContainerUpdateCenter';
import MaintenanceCalendar from '../MaintenanceCalendar';
import QuickActionsWidget from '../QuickActionsWidget';
import NotebookWidget from '../NotebookWidget';
import RSSFeedWidget from '../RSSFeedWidget';
import IFrameWidget from '../IFrameWidget';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';

export const toolWidgets: DashboardItem[] = [
  // Operations & Management Widgets
  {
    id: 'AnsiblePlaybookRunner',
    title: 'Ansible Playbook Runner',
    size: 'large',
    category: 'tools',
    component: <AnsiblePlaybookRunner />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <AnsiblePlaybookRunner
        configuration={configuration}
        isPreview={configuration?.isPreview as boolean}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'ContainerUpdateCenter',
    title: 'Container Update Center',
    size: 'large',
    settings: undefined,
    component: <ContainerUpdateCenter />,
  },
  {
    id: 'MaintenanceCalendar',
    title: 'Maintenance Calendar',
    size: 'large',
    settings: undefined,
    component: <MaintenanceCalendar />,
  },
  {
    id: 'QuickActionsWidget',
    title: 'Quick Actions',
    size: 'medium',
    settings: undefined,
    component: <QuickActionsWidget />,
  },
  // Productivity & Integration Widgets
  {
    id: 'NotebookWidget',
    title: 'Notebook/Notes',
    size: 'large',
    settings: undefined,
    component: <NotebookWidget />,
  },
  {
    id: 'RSSFeedWidget',
    title: 'RSS/News Feed',
    size: 'large',
    settings: undefined,
    component: <RSSFeedWidget />,
  },
  {
    id: 'IFrameWidget',
    title: 'iFrame Embed',
    size: 'large',
    settings: [
      { type: 'title', label: 'Widget Title', defaultValue: 'External Service' },
      { type: 'customText', label: 'URL', defaultValue: 'https://example.com' }
    ],
    component: <IFrameWidget />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <IFrameWidget 
        title={configuration?.title as string || 'External Service'}
        defaultUrl={configuration?.customText as string || ''}
      />
    ),
    hasSettings: true,
  },
];
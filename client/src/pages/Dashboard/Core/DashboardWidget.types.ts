/**
 * Dashboard Widget Type Definitions
 * Strongly typed interfaces for dashboard widgets
 */

import { WidgetConfiguration } from './WidgetSettings.types';

export type DashboardItemSize = 'small' | 'medium' | 'large' | 'wide' | 'full';

export interface DashboardWidget {
  id: string;
  widgetType: string;
  title: string;
  size: DashboardItemSize;
  position: number;
  settings?: WidgetConfiguration;
}

export interface DashboardItem {
  id: string;
  component: React.ReactNode;
  size: DashboardItemSize;
  title: string;
  category?: 'monitoring' | 'charts' | 'tools';
  componentFactory?: (settings: WidgetConfiguration) => React.ReactNode;
  widgetSettings?: WidgetConfiguration;
  hasSettings?: boolean;
}

export interface Dashboard {
  _id?: string;
  name: string;
  description?: string;
  pages: DashboardPage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardPage {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
}
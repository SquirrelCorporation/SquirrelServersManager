/**
 * Type definitions for Dashboard Layout Engine
 */

import React from 'react';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';

export type DashboardItemSize = 'small' | 'medium' | 'large' | 'wide' | 'full';

export type SettingType = 'statistics' | 'icon' | 'backgroundColor' | 'title' | 'customText' | 'dateRange' | 'colorPalette';

export interface WidgetSettings {
  type: SettingType;
  label: string;
  defaultValue?: any;
}

export interface DashboardItem {
  id: string;
  component: React.ReactNode;
  size: DashboardItemSize;
  title: string;
  category?: 'monitoring' | 'charts' | 'tools';
  settings?: WidgetSettings[];
  componentFactory?: (widgetSettings?: WidgetConfiguration) => React.ReactNode;
  widgetSettings?: WidgetConfiguration;
  settingsComponent?: React.ComponentType<{
    value?: any;
    onChange?: (value: any) => void;
    widgetSettings?: any;
  }>; // Custom settings component
  hasSettings?: boolean;
}

// Size configuration
export const sizeToColSpan: Record<DashboardItemSize, number> = {
  small: 8, // 1/3 of row
  medium: 12, // 1/2 of row
  large: 16, // 2/3 of row
  wide: 24, // full width
  full: 24, // full width
};

// Size to min height for visualization
export const sizeToMinHeight: Record<DashboardItemSize, number> = {
  small: 200,
  medium: 250,
  large: 300,
  wide: 350,
  full: 400,
};
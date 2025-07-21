/**
 * Type definitions for Dashboard Layout Engine
 */

import React from 'react';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';

export type DashboardItemSize = 'small' | 'small-medium' | 'medium' | 'medium-large' | 'large' | 'wide' | 'full' | 'two-thirds';

export type SettingType = 'statistics' | 'icon' | 'backgroundColor' | 'title' | 'customText' | 'dateRange' | 'colorPalette';

export interface WidgetSettings {
  type: SettingType;
  label: string;
  defaultValue?: string | number | boolean | Record<string, unknown>;
  selectionMode?: 'single' | 'multiple';
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
  debugData?: Record<string, unknown>; // Debug data collected from the component
}

// Size configuration - 4 column grid system
export const sizeToColSpan: Record<DashboardItemSize, number> = {
  small: 6, // 1/4 of row (1 column)
  'small-medium': 8, // 1/3 of row (special case for tips)
  medium: 12, // 1/2 of row (2 columns)
  'medium-large': 16, // 2/3 of row (special case for welcome header)
  'two-thirds': 18, // 3/4 of row (3 columns) - special for LineChart
  large: 24, // full width (4 columns)
  wide: 24, // full width (4 columns) - deprecated, use large
  full: 24, // full width (4 columns) - deprecated, use large
};

// Size to min height for visualization
export const sizeToMinHeight: Record<DashboardItemSize, number> = {
  small: 200,
  'small-medium': 225,
  medium: 250,
  'medium-large': 275,
  'two-thirds': 275,
  large: 300,
  wide: 350,
  full: 400,
};
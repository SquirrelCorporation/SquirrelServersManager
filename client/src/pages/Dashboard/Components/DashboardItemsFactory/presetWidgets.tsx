/**
 * Preset Widget Definitions
 * Pre-configured widgets for common monitoring scenarios
 */

import React from 'react';
import SystemPerformanceCard from '../SystemPerformanceCard';
import AvailabilityCard from '../AvailabilityCard';
import ContainersCard from '../ContainersCard';
import CombinedPowerCard from '../CombinedPowerCard';
import TimeSeriesLineChart from '../TimeSeriesLineChart';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { WIDGET_FIELDS, WIDGET_DEFAULTS } from '../../constants/widgetConstants';

export const presetWidgets: DashboardItem[] = [
  {
    id: 'SystemPerformanceCard',
    title: 'System Performance',
    size: 'small',
    settings: [
      { type: 'colorPalette', label: 'Color Theme', defaultValue: 'default' }
    ],
    component: <SystemPerformanceCard />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <SystemPerformanceCard 
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'AvailabilityCard',
    title: 'System Availability',
    size: 'small',
    settings: [
      { type: 'colorPalette', label: 'Color Theme', defaultValue: 'default' }
    ],
    component: <AvailabilityCard />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <AvailabilityCard 
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'ContainersCard',
    title: 'Containers Status',
    size: 'small',
    settings: [
      { type: 'colorPalette', label: 'Color Theme', defaultValue: 'default' }
    ],
    component: <ContainersCard />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <ContainersCard 
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'CombinedPowerCard',
    title: 'Combined Power',
    size: 'small',
    settings: [
      { type: 'colorPalette', label: 'Color Theme', defaultValue: 'default' }
    ],
    component: <CombinedPowerCard />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <CombinedPowerCard 
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'MainChartCard',
    title: 'Historical Analytics',
    size: 'large',
    settings: [
      { type: 'colorPalette', label: 'Color Theme', defaultValue: 'default' }
    ],
    component: <TimeSeriesLineChart />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <TimeSeriesLineChart 
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
];
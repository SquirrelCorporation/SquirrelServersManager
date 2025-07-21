/**
 * Chart Widget Definitions
 */

import React from 'react';
import { BarChartOutlined, GlobalOutlined, DownloadOutlined } from '@ant-design/icons';
import LineChart from '../LineChart';
import CircularProgressChart from '../CircularProgressChart';
import DonutChart from '../DonutChart';
import GroupedBarChart from '../GroupedBarChart';
import DonutChartWithTable from '../DonutChartWithTable';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { WIDGET_FIELDS, WIDGET_DEFAULTS, DATA_TYPES, METRICS, DATE_RANGE_PRESETS, COLOR_PALETTES } from '../../constants/widgetConstants';
import { createWidgetDebugData } from '../useWidgetDebugData';
import { 
  toursAvailableData,
  toursLegend,
  websiteVisitsData,
  osDownloadsData,
  performanceLineData,
  storageTypesData 
} from './widgetData';

export const chartWidgets: DashboardItem[] = [
  {
    id: 'medium-graph',
    title: 'Line Chart',
    size: 'medium',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Graph Title', defaultValue: 'Metric Trends' },
      { type: 'dateRange', label: 'Date Range' },
      { type: 'colorPalette', label: 'Color Theme' }
    ],
    component: (
      <LineChart
        title="Metric Trends"
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <LineChart
        title={configuration?.[WIDGET_FIELDS.TITLE] as string || "Metric Trends"}
        dataType={configuration?.[WIDGET_FIELDS.STATISTICS_TYPE] as string || WIDGET_DEFAULTS.DATA_TYPE}
        source={configuration?.[WIDGET_FIELDS.STATISTICS_SOURCE] || WIDGET_DEFAULTS.EMPTY_ARRAY}
        metrics={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] ? [configuration[WIDGET_FIELDS.STATISTICS_METRIC] as string] : [WIDGET_DEFAULTS.METRIC]}
        dateRangePreset={configuration?.[WIDGET_FIELDS.DATE_RANGE_PRESET] as string || WIDGET_DEFAULTS.DATE_RANGE}
        customDateRange={configuration?.[WIDGET_FIELDS.CUSTOM_DATE_RANGE]}
        isPreview={configuration?.[WIDGET_FIELDS.IS_PREVIEW] as boolean}
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'percentage',
    title: 'Circular Progress Chart',
    size: 'small',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Widget Title', defaultValue: 'Circular Progress' },
      { type: 'colorPalette', label: 'Progress Color Theme', defaultValue: 'default' },
      { type: 'backgroundColor', label: 'Background Color Theme', defaultValue: 'default' },
      { type: 'icon', label: 'Icon' }
    ],
    component: (
      <CircularProgressChart
        title="Circular Progress"
        isPreview={true}
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <CircularProgressChart
        title={configuration?.[WIDGET_FIELDS.TITLE] as string || "Circular Progress"}
        dataType={configuration?.[WIDGET_FIELDS.STATISTICS_TYPE] as string || WIDGET_DEFAULTS.DATA_TYPE}
        source={configuration?.[WIDGET_FIELDS.STATISTICS_SOURCE] || 'all'}
        metric={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] as string || WIDGET_DEFAULTS.METRIC}
        icon={configuration?.[WIDGET_FIELDS.ICON] as React.ReactNode}
        illustrationUrl={configuration?.[WIDGET_FIELDS.ILLUSTRATION_URL] as string}
        defaultValue={configuration?.[WIDGET_FIELDS.DEFAULT_VALUE] as string || '0'}
        isPreview={configuration?.[WIDGET_FIELDS.IS_PREVIEW] as boolean}
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        backgroundColorPalette={configuration?.[WIDGET_FIELDS.BACKGROUND_COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'ring-progress',
    title: 'Donut Chart',
    size: 'small',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {}, selectionMode: 'single' },
      { type: 'title', label: 'Widget Title', defaultValue: 'Donut Chart' },
      { type: 'colorPalette', label: 'Color Theme' }
    ],
    component: (
      <DonutChart
        title="Donut Chart"
        isPreview={true}
        totalTours={186}
        mainLabel="Total"
        chartData={toursAvailableData}
        legendItems={toursLegend}
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <DonutChart
        title={configuration?.[WIDGET_FIELDS.TITLE] as string || "Donut Chart"}
        dataType={configuration?.[WIDGET_FIELDS.STATISTICS_TYPE] as string || WIDGET_DEFAULTS.DATA_TYPE}
        source={configuration?.[WIDGET_FIELDS.STATISTICS_SOURCE] || WIDGET_DEFAULTS.EMPTY_ARRAY}
        metric={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] as string || WIDGET_DEFAULTS.METRIC}
        isPreview={configuration?.[WIDGET_FIELDS.IS_PREVIEW] as boolean}
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
        mainLabel={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] as string || "Total"}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'website-visits',
    title: 'Monthly Comparison',
    size: 'medium',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Chart Title', defaultValue: 'Monthly Comparison' },
      { type: 'dateRange', label: 'Date Range' },
      { type: 'colorPalette', label: 'Color Theme' }
    ],
    component: (
      <GroupedBarChart
        title="Monthly Comparison"
        subtitle="(+43%) than last year"
        chartData={websiteVisitsData}
        categoryColors={{ 'Group A': '#40a9ff', 'Group B': '#ffc53d' }}
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <GroupedBarChart
        title={configuration?.[WIDGET_FIELDS.TITLE] as string || "Monthly Comparison"}
        subtitle="Device metrics comparison"
        dataType={configuration?.[WIDGET_FIELDS.STATISTICS_TYPE] as string || WIDGET_DEFAULTS.DATA_TYPE}
        source={configuration?.[WIDGET_FIELDS.STATISTICS_SOURCE] || WIDGET_DEFAULTS.EMPTY_ARRAY}
        metrics={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] ? [configuration[WIDGET_FIELDS.STATISTICS_METRIC] as string] : [METRICS.CPU_USAGE, METRICS.MEMORY_USAGE]}
        dateRangePreset={configuration?.[WIDGET_FIELDS.DATE_RANGE_PRESET] as string || DATE_RANGE_PRESETS.LAST_6_MONTHS}
        customDateRange={configuration?.[WIDGET_FIELDS.CUSTOM_DATE_RANGE]}
        isPreview={configuration?.[WIDGET_FIELDS.IS_PREVIEW] as boolean}
        colorPalette={configuration?.[WIDGET_FIELDS.COLOR_PALETTE] as string || WIDGET_DEFAULTS.COLOR_PALETTE}
        customColors={configuration?.[WIDGET_FIELDS.CUSTOM_COLORS] as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'total-downloads',
    title: 'OS Downloads',
    size: 'medium',
    settings: undefined,
    component: (
      <DonutChartWithTable
        title="OS Downloads"
        subtitle="Platform distribution"
        totalDownloadsLabel="Total"
        totalDownloadsValue="415"
        chartData={osDownloadsData}
      />
    ),
  },
];
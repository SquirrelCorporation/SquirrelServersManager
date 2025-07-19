/**
 * Chart Widget Definitions
 */

import React from 'react';
import { PieChartOutlined, BarChartOutlined, GlobalOutlined, DownloadOutlined, MessageOutlined } from '@ant-design/icons';
import LineChart from '../LineChart';
import CircularProgressChart from '../CircularProgressChart';
import DonutChart from '../DonutChart';
import TinyLineChart from '../TinyLineChart';
import PieChart from '../PieChart';
import GroupedBarChart from '../GroupedBarChart';
import DonutChartWithTable from '../DonutChartWithTable';
import StackedBarChart from '../StackedBarChart';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { 
  gradientChartData,
  toursAvailableData,
  toursLegend,
  visitsPieData,
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
        title={configuration?.title as string || "Metric Trends"}
        dataType={configuration?.dataType as string || 'device'}
        source={configuration?.source as string[] || 'all'}
        metrics={configuration?.metric ? [configuration.metric as string] : ['cpu_usage', 'memory_usage']}
        dateRangePreset={configuration?.dateRangePreset as string || 'last7days'}
        customDateRange={configuration?.customDateRange}
        isPreview={configuration?.isPreview as boolean}
        colorPalette={configuration?.colorPalette as string || 'default'}
        customColors={configuration?.customColors as string[]}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'progress-lines-graph',
    title: 'Line Chart',
    size: 'medium',
    settings: undefined,
    component: (
      <LineChart
        title="Performance Metrics"
      />
    ),
  },
  {
    id: 'percentage',
    title: 'Tours Available',
    size: 'small',
    settings: undefined,
    component: (
      <CircularProgressChart
        title="Tours Available"
        percentage={66}
        subtitle="186 Total"
      />
    ),
  },
  {
    id: 'ring-progress',
    title: 'Tours Available',
    size: 'medium',
    settings: undefined,
    component: (
      <DonutChart
        title="Tours Available"
        data={toursAvailableData}
        legend={toursLegend}
        centerContent={{ label: '186', sublabel: 'Total' }}
      />
    ),
  },
  {
    id: 'line-gradient',
    title: 'New Messages',
    size: 'medium',
    settings: undefined,
    component: (
      <TinyLineChart
        title="New Messages"
        subtitle="(+25%)"
        value="3,052"
        data={gradientChartData}
        icon={<MessageOutlined />}
      />
    ),
  },
  {
    id: 'pie-chart',
    title: 'Current Visits',
    size: 'medium',
    settings: undefined,
    component: (
      <PieChart
        title="Current Visits"
        data={visitsPieData}
        icon={<PieChartOutlined />}
      />
    ),
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
        title={configuration?.title as string || "Monthly Comparison"}
        subtitle="Device metrics comparison"
        dataType={configuration?.dataType as string || 'device'}
        source={configuration?.source as string[] || 'all'}
        metrics={configuration?.metric ? [configuration.metric as string] : ['cpu_usage', 'memory_usage']}
        dateRangePreset={configuration?.dateRangePreset as string || 'last6months'}
        customDateRange={configuration?.customDateRange}
        isPreview={configuration?.isPreview as boolean}
        colorPalette={configuration?.colorPalette as string || 'default'}
        customColors={configuration?.customColors as string[]}
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
  {
    id: 'area-chart',
    title: 'Regional Metrics',
    size: 'medium',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Chart Title', defaultValue: 'Regional Metrics' },
      { type: 'dateRange', label: 'Date Range' },
      { type: 'colorPalette', label: 'Color Theme' }
    ],
    component: (
      <StackedBarChart
        title="Regional Metrics"
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <StackedBarChart
        title={configuration?.title as string || "Regional Metrics"}
        dataType={configuration?.dataType as string || 'device'}
        source={configuration?.source as string[] || 'all'}
        metric={configuration?.metric as string || 'cpu_usage'}
        dateRangePreset={configuration?.dateRangePreset as string || 'last7days'}
        customDateRange={configuration?.customDateRange}
        isPreview={configuration?.isPreview as boolean}
        colorPalette={configuration?.colorPalette as string || 'default'}
        customColors={configuration?.customColors as string[]}
      />
    ),
    hasSettings: true,
  },
];
/**
 * Statistics Widget Definitions
 */

import React from 'react';
import { DashboardOutlined, ShoppingCartOutlined, CloseCircleOutlined, UserAddOutlined, ShoppingOutlined } from '@ant-design/icons';
import SummaryStatCard from '../SummaryStatCard';
import CompactStatCard from '../CompactStatCard';
import ProgressBarsCard from '../ProgressBarsCard';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { WIDGET_FIELDS, WIDGET_DEFAULTS } from '../../constants/widgetConstants';
import { bookingStatuses } from './widgetData';

export const statisticsWidgets: DashboardItem[] = [
  {
    id: 'single-number-variation',
    title: 'Summary Stat',
    size: 'small',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Widget Title', defaultValue: 'Summary Stat' },
    ],
    component: (
      <SummaryStatCard
        title="Summary Stat"
        defaultValue="0"
        defaultTrend="0"
        icon={<DashboardOutlined />}
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <SummaryStatCard
        title={configuration?.[WIDGET_FIELDS.TITLE] as string || "Summary Stat"}
        dataType={configuration?.[WIDGET_FIELDS.STATISTICS_TYPE] as string || WIDGET_DEFAULTS.DATA_TYPE}
        source={configuration?.[WIDGET_FIELDS.STATISTICS_SOURCE] || WIDGET_DEFAULTS.EMPTY_ARRAY}
        metric={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] as string || WIDGET_DEFAULTS.METRIC}
        defaultValue="0"
        defaultTrend="0"
        icon={<DashboardOutlined />}
        isPreview={configuration?.[WIDGET_FIELDS.IS_PREVIEW] as boolean}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'compact-stat-card',
    title: 'Metric Card With Trend',
    size: 'small',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Widget Title', defaultValue: 'Metric Card' },
    ],
    component: (
      <CompactStatCard
        title="Average CPU Usage"
        value="65%"
        trendValue="5.2"
        trendDirection="up"
        trendDescription="last 24 hours"
        trendColor="#52c41a"
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <CompactStatCard
        title={configuration?.[WIDGET_FIELDS.TITLE] as string || "Metric Card"}
        dataType={configuration?.[WIDGET_FIELDS.STATISTICS_TYPE] as string || WIDGET_DEFAULTS.DATA_TYPE}
        source={configuration?.[WIDGET_FIELDS.STATISTICS_SOURCE] || WIDGET_DEFAULTS.EMPTY_ARRAY}
        metric={configuration?.[WIDGET_FIELDS.STATISTICS_METRIC] as string || WIDGET_DEFAULTS.METRIC}
        isPreview={configuration?.[WIDGET_FIELDS.IS_PREVIEW] as boolean}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'progress-bars',
    title: 'Progress Bars',
    size: 'small',
    settings: undefined,
    component: (
      <ProgressBarsCard
        title="Progress Bars"
        statuses={bookingStatuses}
      />
    ),
  },
];
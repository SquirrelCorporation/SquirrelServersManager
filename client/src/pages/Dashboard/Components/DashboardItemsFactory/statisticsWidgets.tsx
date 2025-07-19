/**
 * Statistics Widget Definitions
 */

import React from 'react';
import { DashboardOutlined, ShoppingCartOutlined, CloseCircleOutlined, UserAddOutlined, ShoppingOutlined } from '@ant-design/icons';
import SummaryStatCard from '../SummaryStatCard';
import CompactStatCard from '../CompactStatCard';
import BookingStatusCard from '../BookingStatusCard';
import { DashboardItem } from '../../Core/DashboardWidget.types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { bookingStatuses } from './widgetData';

export const statisticsWidgets: DashboardItem[] = [
  {
    id: 'single-number-variation',
    title: 'Total balance',
    size: 'small',
    settings: [
      { type: 'statistics', label: 'Statistics Configuration', defaultValue: {} },
      { type: 'title', label: 'Widget Title', defaultValue: 'Total balance' },
    ],
    component: (
      <SummaryStatCard
        title="Total balance"
        defaultValue="18,765"
        defaultTrend="-0.1"
        icon={<DashboardOutlined />}
      />
    ),
    componentFactory: (configuration: WidgetConfiguration) => (
      <SummaryStatCard
        title={configuration?.title as string || "Total balance"}
        dataType={configuration?.statistics?.dataType || 'device'}
        source={configuration?.statistics?.source || 'all'}
        metric={configuration?.statistics?.metric || 'cpu_usage'}
        defaultValue="0"
        defaultTrend="0"
        icon={<DashboardOutlined />}
        isPreview={configuration?.isPreview as boolean}
      />
    ),
    hasSettings: true,
  },
  {
    id: 'single-number-card-variation',
    title: 'Total orders',
    size: 'small',
    settings: undefined,
    component: (
      <SummaryStatCard
        title="Total orders"
        defaultValue="6,584"
        defaultTrend="+15.03"
        icon={<ShoppingCartOutlined />}
      />
    ),
  },
  {
    id: 'single-number-variation-popover',
    title: 'Total revenue',
    size: 'small',
    settings: undefined,
    component: (
      <SummaryStatCard
        title="Total revenue"
        defaultValue="3,458"
        defaultTrend="+3.1"
        icon={<CloseCircleOutlined />}
      />
    ),
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
        trend={5.2}
        subtitle="Last 24 hours"
        icon={<DashboardOutlined />}
        backgroundColor="#1a1a1a"
      />
    ),
  },
  {
    id: 'booking-status',
    title: 'Booking Status',
    size: 'small',
    settings: undefined,
    component: (
      <BookingStatusCard
        title="Booking Status"
        items={bookingStatuses}
      />
    ),
  },
  {
    id: 'single-number-new-customers',
    title: 'New customers',
    size: 'small',
    settings: undefined,
    component: (
      <SummaryStatCard
        title="New customers"
        defaultValue="+89"
        defaultTrend="+0.0"
        icon={<UserAddOutlined />}
      />
    ),
  },
  {
    id: 'single-number-orders-pending',
    title: 'Orders pending',
    size: 'small',
    settings: undefined,
    component: (
      <SummaryStatCard
        title="Orders pending"
        defaultValue="128"
        defaultTrend="-25"
        icon={<ShoppingOutlined />}
      />
    ),
  },
];
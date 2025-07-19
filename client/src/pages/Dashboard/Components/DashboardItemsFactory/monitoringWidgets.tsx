/**
 * Monitoring Widget Definitions
 */

import React from 'react';
import SystemPerformanceCard from '../SystemPerformanceCard';
import AvailabilityCard from '../AvailabilityCard';
import ContainersCard from '../ContainersCard';
import CombinedPowerCard from '../CombinedPowerCard';
import TimeSeriesLineChart from '../TimeSeriesLineChart';
import { DashboardItem } from '../../Core/DashboardWidget.types';

export const monitoringWidgets: DashboardItem[] = [
  {
    id: 'SystemPerformanceCard',
    title: 'System Performance',
    size: 'small',
    settings: undefined,
    component: <SystemPerformanceCard />,
  },
  {
    id: 'AvailabilityCard',
    title: 'System Availability',
    size: 'small',
    settings: undefined,
    component: <AvailabilityCard />,
  },
  {
    id: 'ContainersCard',
    title: 'Containers Status',
    size: 'small',
    settings: undefined,
    component: <ContainersCard />,
  },
  {
    id: 'CombinedPowerCard',
    title: 'Combined Power',
    size: 'small',
    settings: undefined,
    component: <CombinedPowerCard />,
  },
  {
    id: 'MainChartCard',
    title: 'Historical Analytics',
    size: 'full',
    settings: undefined,
    component: <TimeSeriesLineChart />,
  },
];
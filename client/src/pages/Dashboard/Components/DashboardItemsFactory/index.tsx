/**
 * Dashboard Items Factory
 * Main factory function that combines all widget modules
 */

import { DashboardItem } from '../../Core/DashboardWidget.types';
import { statisticsWidgets } from './statisticsWidgets';
import { chartWidgets } from './chartWidgets';
import { monitoringWidgets } from './monitoringWidgets';
import { toolWidgets } from './toolWidgets';
import { specialWidgets } from './specialWidgets';
import { presetWidgets } from './presetWidgets';

// Factory function to create dashboard items
export const createDashboardItems = (): DashboardItem[] => {
  return [
    ...specialWidgets,
    ...presetWidgets,
    ...statisticsWidgets,
    ...chartWidgets,
    ...monitoringWidgets,
    ...toolWidgets,
  ];
};

export default createDashboardItems;
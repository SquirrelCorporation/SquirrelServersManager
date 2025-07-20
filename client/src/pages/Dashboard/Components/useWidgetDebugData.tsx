import { useEffect } from 'react';
import { useDebugData } from './DashboardLayoutEngine/DebugDataProvider';

interface WidgetDebugInfo {
  widgetId?: string;
  componentName: string;
  fileName: string;
  rawApiData?: Record<string, unknown>;
  processedData?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export const useWidgetDebugData = (debugInfo: WidgetDebugInfo) => {
  // This hook would be used inside widgets, but since we're wrapping from outside,
  // we'll use a different approach
  
  // For now, this is a placeholder for future widget integration
  return null;
};

// Helper to create debug data for widgets
export const createWidgetDebugData = (
  componentName: string,
  fileName: string,
  props: Record<string, unknown>
): Record<string, unknown> => {
  const { children, ...safeProps } = props;
  
  return {
    componentName,
    fileName,
    props: safeProps,
    config: {
      dataType: safeProps.dataType,
      source: safeProps.source,
      metric: safeProps.metric || safeProps.metrics,
      dateRangePreset: safeProps.dateRangePreset,
      colorPalette: safeProps.colorPalette,
    },
    settings: safeProps.widgetSettings || safeProps.settings || {},
  };
};
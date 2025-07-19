/**
 * Widget Settings Schemas
 * Define schemas for all dashboard widgets
 */

import { WidgetSettingsSchema } from '../WidgetSettings.types';
import { widgetSettingsManager } from '../WidgetSettingsManager';

// Statistics-based widgets schema
const statisticsWidgetSchema: WidgetSettingsSchema = {
  version: '1.0',
  fields: {
    title: {
      type: 'text',
      label: 'Widget Title',
      required: true,
      defaultValue: 'Statistics',
    },
    statistics: {
      type: 'statistics',
      label: 'Data Configuration',
      required: true,
      defaultValue: {
        dataType: 'device',
        source: ['all'],
        metric: 'cpu_usage',
      },
    },
    dateRange: {
      type: 'dateRange',
      label: 'Date Range',
      defaultValue: {
        preset: 'last7days',
      },
    },
    colorPalette: {
      type: 'colorPalette',
      label: 'Color Theme',
      defaultValue: {
        id: 'default',
      },
    },
  },
  layout: {
    type: 'sections',
    groups: [
      {
        id: 'basic',
        label: 'Basic Settings',
        fields: ['title'],
        defaultExpanded: true,
      },
      {
        id: 'data',
        label: 'Data Configuration',
        fields: ['statistics', 'dateRange'],
        defaultExpanded: true,
      },
      {
        id: 'appearance',
        label: 'Appearance',
        fields: ['colorPalette'],
        defaultExpanded: false,
      },
    ],
  },
};

// Line Chart schema
const lineChartSchema: WidgetSettingsSchema = {
  version: '1.0',
  fields: {
    title: {
      type: 'text',
      label: 'Chart Title',
      required: true,
      defaultValue: 'Metric Trends',
    },
    statistics: {
      type: 'statistics',
      label: 'Data Configuration',
      required: true,
      defaultValue: {
        dataType: 'device',
        source: ['all'],
        metric: 'cpu_usage',
      },
      supportedMetrics: {
        device: ['cpu_usage', 'memory_usage', 'storage_usage'],
        container: ['container_cpu_usage', 'container_memory_usage'],
      },
    },
    dateRange: {
      type: 'dateRange',
      label: 'Date Range',
      defaultValue: {
        preset: 'last7days',
      },
    },
    colorPalette: {
      type: 'colorPalette',
      label: 'Color Theme',
      defaultValue: {
        id: 'default',
      },
    },
    showLegend: {
      type: 'boolean',
      label: 'Show Legend',
      defaultValue: true,
    },
    showGrid: {
      type: 'boolean',
      label: 'Show Grid',
      defaultValue: true,
    },
  },
  layout: {
    type: 'tabs',
    groups: [
      {
        id: 'general',
        label: 'General',
        fields: ['title', 'statistics', 'dateRange'],
      },
      {
        id: 'appearance',
        label: 'Appearance',
        fields: ['colorPalette', 'showLegend', 'showGrid'],
      },
    ],
  },
};

// Ansible Playbook Runner schema
const ansiblePlaybookRunnerSchema: WidgetSettingsSchema = {
  version: '1.0',
  fields: {
    title: {
      type: 'text',
      label: 'Widget Title',
      defaultValue: 'Ansible Playbooks',
    },
    playbooks: {
      type: 'playbook',
      label: 'Playbook Configuration',
      required: true,
      defaultValue: {
        selectedPlaybooks: [],
      },
      maxPlaybooks: 10,
      requireDeviceSelection: false,
    },
    showTags: {
      type: 'boolean',
      label: 'Show Playbook Tags',
      defaultValue: true,
    },
    showDeviceCount: {
      type: 'boolean',
      label: 'Show Target Device Count',
      defaultValue: true,
    },
  },
  layout: {
    type: 'sections',
    groups: [
      {
        id: 'basic',
        label: 'Basic Settings',
        fields: ['title'],
        defaultExpanded: true,
      },
      {
        id: 'playbooks',
        label: 'Playbook Selection',
        fields: ['playbooks'],
        defaultExpanded: true,
      },
      {
        id: 'display',
        label: 'Display Options',
        fields: ['showTags', 'showDeviceCount'],
        defaultExpanded: false,
      },
    ],
  },
};

// IFrame Widget schema
const iframeWidgetSchema: WidgetSettingsSchema = {
  version: '1.0',
  fields: {
    title: {
      type: 'text',
      label: 'Widget Title',
      required: true,
      defaultValue: 'External Service',
    },
    url: {
      type: 'text',
      label: 'URL',
      required: true,
      placeholder: 'https://example.com',
      validation: {
        validate: (value: string) => {
          try {
            new URL(value);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        },
      },
    },
    height: {
      type: 'number',
      label: 'Height (pixels)',
      defaultValue: 400,
      min: 200,
      max: 800,
    },
    refreshInterval: {
      type: 'select',
      label: 'Refresh Interval',
      defaultValue: 0,
      options: [
        { label: 'No refresh', value: 0 },
        { label: 'Every 30 seconds', value: 30 },
        { label: 'Every minute', value: 60 },
        { label: 'Every 5 minutes', value: 300 },
        { label: 'Every 15 minutes', value: 900 },
      ],
    },
  },
};

// Register all schemas
export function registerWidgetSchemas(): void {
  // Statistics widgets
  widgetSettingsManager.registerSchema('single-number-variation', statisticsWidgetSchema);
  widgetSettingsManager.registerSchema('compact-stat-card', statisticsWidgetSchema);
  widgetSettingsManager.registerSchema('summary-stat-card', statisticsWidgetSchema);
  
  // Chart widgets
  widgetSettingsManager.registerSchema('line-chart', lineChartSchema);
  widgetSettingsManager.registerSchema('area-chart', lineChartSchema);
  widgetSettingsManager.registerSchema('stacked-bar-chart', {
    ...lineChartSchema,
    fields: {
      ...lineChartSchema.fields,
      stacked: {
        type: 'boolean',
        label: 'Stack Bars',
        defaultValue: true,
      },
    },
  });
  
  // Playbook widget
  widgetSettingsManager.registerSchema('AnsiblePlaybookRunner', ansiblePlaybookRunnerSchema);
  
  // IFrame widget
  widgetSettingsManager.registerSchema('IFrameWidget', iframeWidgetSchema);
}

// Initialize schemas
registerWidgetSchemas();
# Dashboard Widget Settings Framework

A comprehensive, type-safe framework for managing dashboard widget configurations.

## Overview

This framework provides:
- **Strong TypeScript typing** - No "any" types, full type safety
- **Schema-based validation** - Define widget settings with validation rules
- **Automatic UI generation** - Settings UI is generated from schemas
- **Extensible field types** - Built-in types + custom field support
- **React hooks integration** - Easy to use in React components

## Architecture

```
Core/
├── WidgetSettings.types.ts      # Core type definitions
├── WidgetSettingsManager.ts     # Settings validation & management
├── WidgetSettingsProvider.tsx   # React context & hooks
├── WidgetSettingsRenderer.tsx   # Auto-generates settings UI
├── WidgetSettingsDrawer.tsx     # Settings drawer component
├── DashboardWidget.types.ts     # Dashboard widget types
├── schemas/                     # Widget settings schemas
└── components/                  # Reusable field components
    ├── StatisticsSelector.tsx
    └── PlaybookSelector.tsx
```

## Usage

### 1. Define a Widget Settings Schema

```typescript
import { WidgetSettingsSchema } from '../Core/WidgetSettings.types';

const myWidgetSchema: WidgetSettingsSchema = {
  version: '1.0',
  fields: {
    title: {
      type: 'text',
      label: 'Widget Title',
      required: true,
      defaultValue: 'My Widget',
    },
    refreshInterval: {
      type: 'number',
      label: 'Refresh Interval (seconds)',
      min: 10,
      max: 300,
      defaultValue: 60,
    },
    theme: {
      type: 'select',
      label: 'Theme',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
      defaultValue: 'light',
    },
  },
  layout: {
    type: 'sections',
    groups: [
      {
        id: 'basic',
        label: 'Basic Settings',
        fields: ['title', 'theme'],
      },
      {
        id: 'advanced',
        label: 'Advanced',
        fields: ['refreshInterval'],
      },
    ],
  },
};
```

### 2. Register the Schema

```typescript
import { widgetSettingsManager } from '../Core/WidgetSettingsManager';

widgetSettingsManager.registerSchema('my-widget', myWidgetSchema);
```

### 3. Create Your Widget Component

```typescript
import React from 'react';
import { WidgetConfiguration } from '../Core/WidgetSettings.types';

interface MyWidgetProps {
  configuration?: WidgetConfiguration;
}

const MyWidget: React.FC<MyWidgetProps> = ({ configuration }) => {
  // Extract typed settings
  const title = configuration?.title as string || 'Default Title';
  const refreshInterval = configuration?.refreshInterval as number || 60;
  const theme = configuration?.theme as 'light' | 'dark' || 'light';
  
  return (
    <div className={`widget theme-${theme}`}>
      <h3>{title}</h3>
      {/* Widget content */}
    </div>
  );
};
```

### 4. Add to Dashboard Factory

```typescript
const dashboardItems: DashboardItem[] = [
  {
    id: 'my-widget',
    title: 'My Widget',
    size: 'medium',
    component: <MyWidget />,
    componentFactory: (configuration: WidgetConfiguration) => (
      <MyWidget configuration={configuration} />
    ),
    hasSettings: true,
  },
];
```

## Built-in Field Types

- **text** - Text input with validation
- **number** - Number input with min/max
- **boolean** - Switch/toggle
- **select** - Single or multi-select dropdown
- **dateRange** - Date range picker with presets
- **colorPalette** - Color palette selector
- **statistics** - Device/container statistics selector
- **playbook** - Ansible playbook selector
- **custom** - Custom React component

## Custom Field Example

```typescript
const customField: CustomSettingField<string[]> = {
  type: 'custom',
  label: 'Tag Selector',
  component: ({ value, onChange }) => (
    <TagSelector
      selectedTags={value || []}
      onTagsChange={onChange}
    />
  ),
};
```

## Validation

```typescript
const urlField: TextSettingField = {
  type: 'text',
  label: 'API URL',
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
};
```

## React Hooks

```typescript
// Use in settings components
const { configuration, updateConfiguration, isValid } = 
  useWidgetConfiguration('my-widget');

// Access settings context
const { getSchema, validateConfiguration } = useWidgetSettings();
```

## Type Safety

All settings are strongly typed with no "any" types:

```typescript
// Configuration is typed
interface StatisticsConfig {
  dataType: 'device' | 'container';
  source: string[];
  metric: string;
  aggregation?: 'average' | 'sum' | 'min' | 'max';
}

// Field values are typed
const statsField: StatisticsSettingField = {
  type: 'statistics',
  label: 'Data Configuration',
  defaultValue: {
    dataType: 'device',
    source: ['all'],
    metric: 'cpu_usage',
  },
};
```

## Benefits

1. **No more "any" types** - Full TypeScript type safety
2. **Consistent UI** - All settings follow the same patterns
3. **Validation built-in** - Catch errors before saving
4. **Extensible** - Easy to add new field types
5. **Reusable** - Components can be shared across widgets
6. **Maintainable** - Schema changes automatically update UI
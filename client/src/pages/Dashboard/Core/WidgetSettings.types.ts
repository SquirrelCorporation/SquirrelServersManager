/**
 * Core type definitions for the widget settings framework
 * This provides a type-safe, extensible system for widget configuration
 */

import { Moment } from 'moment';
import { API } from 'ssm-shared-lib';

// Base setting types
export type SettingValueType = 
  | string 
  | number 
  | boolean 
  | string[] 
  | number[]
  | DateRange
  | ColorPalette
  | StatisticsConfig
  | PlaybookConfig
  | Record<string, unknown>;

// Date range configuration
export interface DateRange {
  preset: 'last24hours' | 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastyear' | 'custom';
  customRange?: [Moment, Moment];
}

// Color palette configuration
export interface ColorPalette {
  id: 'default' | 'modern' | 'vibrant' | 'pastel' | 'dark' | 'custom';
  colors?: string[];
}

// Statistics widget configuration
export interface StatisticsConfig {
  dataType: 'device' | 'container';
  source: string[];
  metric: string;
  aggregation?: 'average' | 'sum' | 'min' | 'max';
}

// Playbook widget configuration
export interface PlaybookConfig {
  selectedPlaybooks: Array<{
    uuid: string;
    deviceUuids: string[];
  }>;
}

// Setting field types
export interface BaseSettingField<T extends SettingValueType = SettingValueType> {
  type: string;
  label: string;
  description?: string;
  defaultValue?: T;
  required?: boolean;
  validation?: SettingValidation<T>;
}

export interface TextSettingField extends BaseSettingField<string> {
  type: 'text';
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export interface NumberSettingField extends BaseSettingField<number> {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface BooleanSettingField extends BaseSettingField<boolean> {
  type: 'boolean';
}

export interface SelectSettingField<T extends string | number = string> extends BaseSettingField<T> {
  type: 'select';
  options: Array<{
    label: string;
    value: T;
    icon?: React.ReactNode;
  }>;
  mode?: 'single' | 'multiple';
}

export interface DateRangeSettingField extends BaseSettingField<DateRange> {
  type: 'dateRange';
  presets?: Array<{
    label: string;
    value: DateRange['preset'];
  }>;
}

export interface ColorPaletteSettingField extends BaseSettingField<ColorPalette> {
  type: 'colorPalette';
  allowCustom?: boolean;
  maxColors?: number;
}

export interface StatisticsSettingField extends BaseSettingField<StatisticsConfig> {
  type: 'statistics';
  supportedDataTypes?: Array<'device' | 'container'>;
  supportedMetrics?: Record<string, string[]>;
}

export interface PlaybookSettingField extends BaseSettingField<PlaybookConfig> {
  type: 'playbook';
  maxPlaybooks?: number;
  requireDeviceSelection?: boolean;
}

export interface CustomSettingField<T extends SettingValueType = SettingValueType> extends BaseSettingField<T> {
  type: 'custom';
  component: React.ComponentType<CustomSettingComponentProps<T>>;
}

// Union of all setting field types
export type SettingField = 
  | TextSettingField
  | NumberSettingField
  | BooleanSettingField
  | SelectSettingField
  | DateRangeSettingField
  | ColorPaletteSettingField
  | StatisticsSettingField
  | PlaybookSettingField
  | CustomSettingField;

// Validation types
export interface SettingValidation<T extends SettingValueType = SettingValueType> {
  validate: (value: T) => boolean | string;
  message?: string;
}

// Component props for custom settings
export interface CustomSettingComponentProps<T extends SettingValueType = SettingValueType> {
  value: T | undefined;
  onChange: (value: T) => void;
  field: CustomSettingField<T>;
  disabled?: boolean;
}

// Widget settings schema
export interface WidgetSettingsSchema {
  version: '1.0';
  fields: Record<string, SettingField>;
  layout?: SettingLayout;
  dependencies?: SettingDependencies;
}

// Layout configuration
export interface SettingLayout {
  type: 'default' | 'tabs' | 'sections';
  groups?: Array<{
    id: string;
    label: string;
    fields: string[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }>;
}

// Field dependencies
export interface SettingDependencies {
  [fieldName: string]: {
    dependsOn: string;
    condition: (value: SettingValueType) => boolean;
  };
}

// Widget configuration result
export interface WidgetConfiguration {
  [key: string]: SettingValueType;
}

// Widget settings manager interface
export interface IWidgetSettingsManager {
  getSchema(widgetType: string): WidgetSettingsSchema | undefined;
  validateConfiguration(widgetType: string, config: WidgetConfiguration): ValidationResult;
  getDefaultConfiguration(widgetType: string): WidgetConfiguration;
  serializeConfiguration(config: WidgetConfiguration): string;
  deserializeConfiguration(data: string): WidgetConfiguration;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// Widget with settings
export interface WidgetWithSettings {
  id: string;
  type: string;
  configuration: WidgetConfiguration;
  metadata?: {
    version: string;
    lastModified: Date;
  };
}
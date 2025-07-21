/**
 * Widget Settings Manager
 * Handles validation, serialization, and management of widget configurations
 */

import {
  WidgetSettingsSchema,
  WidgetConfiguration,
  ValidationResult,
  IWidgetSettingsManager,
  SettingField,
  SettingValueType,
} from './WidgetSettings.types';

export class WidgetSettingsManager implements IWidgetSettingsManager {
  private schemas: Map<string, WidgetSettingsSchema> = new Map();

  /**
   * Register a widget settings schema
   */
  registerSchema(widgetType: string, schema: WidgetSettingsSchema): void {
    this.schemas.set(widgetType, schema);
  }

  /**
   * Get schema for a widget type
   */
  getSchema(widgetType: string): WidgetSettingsSchema | undefined {
    return this.schemas.get(widgetType);
  }

  /**
   * Validate a widget configuration against its schema
   */
  validateConfiguration(widgetType: string, config: WidgetConfiguration): ValidationResult {
    const schema = this.getSchema(widgetType);
    if (!schema) {
      return {
        valid: false,
        errors: [{ field: '', message: `No schema found for widget type: ${widgetType}` }],
      };
    }

    const errors: ValidationResult['errors'] = [];

    // Validate each field
    Object.entries(schema.fields).forEach(([fieldName, field]) => {
      const value = config[fieldName];

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: fieldName,
          message: `${field.label} is required`,
        });
        return;
      }

      // Skip validation if value is not provided and field is optional
      if (value === undefined || value === null) {
        return;
      }

      // Type-specific validation
      const fieldError = this.validateField(field, value);
      if (fieldError) {
        errors.push({
          field: fieldName,
          message: fieldError,
        });
      }

      // Custom validation
      if (field.validation) {
        const validationResult = field.validation.validate(value);
        if (validationResult !== true) {
          errors.push({
            field: fieldName,
            message: typeof validationResult === 'string' ? validationResult : field.validation.message || 'Validation failed',
          });
        }
      }
    });

    // Check for unknown fields
    Object.keys(config).forEach(fieldName => {
      if (!schema.fields[fieldName]) {
        errors.push({
          field: fieldName,
          message: `Unknown field: ${fieldName}`,
        });
      }
    });

    // Validate dependencies
    if (schema.dependencies) {
      Object.entries(schema.dependencies).forEach(([fieldName, dependency]) => {
        const dependentValue = config[dependency.dependsOn];
        const shouldShow = dependency.condition(dependentValue);
        
        if (!shouldShow && config[fieldName] !== undefined) {
          // Field should be hidden but has a value
          delete config[fieldName];
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a single field value
   */
  private validateField(field: SettingField, value: SettingValueType): string | null {
    switch (field.type) {
      case 'text': {
        if (typeof value !== 'string') {
          return `Expected string, got ${typeof value}`;
        }
        const textField = field as import('./WidgetSettings.types').TextSettingField;
        if (textField.minLength && value.length < textField.minLength) {
          return `Minimum length is ${textField.minLength}`;
        }
        if (textField.maxLength && value.length > textField.maxLength) {
          return `Maximum length is ${textField.maxLength}`;
        }
        break;
      }

      case 'number': {
        if (typeof value !== 'number') {
          return `Expected number, got ${typeof value}`;
        }
        const numberField = field as import('./WidgetSettings.types').NumberSettingField;
        if (numberField.min !== undefined && value < numberField.min) {
          return `Minimum value is ${numberField.min}`;
        }
        if (numberField.max !== undefined && value > numberField.max) {
          return `Maximum value is ${numberField.max}`;
        }
        break;
      }

      case 'boolean': {
        if (typeof value !== 'boolean') {
          return `Expected boolean, got ${typeof value}`;
        }
        break;
      }

      case 'select': {
        const selectField = field as import('./WidgetSettings.types').SelectSettingField;
        if (selectField.mode === 'multiple') {
          if (!Array.isArray(value)) {
            return `Expected array for multi-select`;
          }
          const invalidValues = (value as Array<string | number>).filter(
            v => !selectField.options.some(opt => opt.value === v)
          );
          if (invalidValues.length > 0) {
            return `Invalid values: ${invalidValues.join(', ')}`;
          }
        } else {
          const validValues = selectField.options.map(opt => opt.value);
          if (!validValues.includes(value as string | number)) {
            return `Invalid value. Expected one of: ${validValues.join(', ')}`;
          }
        }
        break;
      }

      case 'dateRange': {
        const dateValue = value as import('./WidgetSettings.types').DateRange;
        if (!dateValue || typeof dateValue !== 'object') {
          return `Expected date range object`;
        }
        if (!dateValue.preset) {
          return `Date range preset is required`;
        }
        if (dateValue.preset === 'custom' && !dateValue.customRange) {
          return `Custom date range is required when preset is 'custom'`;
        }
        break;
      }

      case 'colorPalette': {
        const colorValue = value as import('./WidgetSettings.types').ColorPalette;
        if (!colorValue || typeof colorValue !== 'object') {
          return `Expected color palette object`;
        }
        if (!colorValue.id) {
          return `Color palette ID is required`;
        }
        if (colorValue.id === 'custom' && (!colorValue.colors || colorValue.colors.length === 0)) {
          return `Custom colors are required when palette is 'custom'`;
        }
        break;
      }

      case 'statistics': {
        const statsValue = value as import('./WidgetSettings.types').StatisticsConfig;
        if (!statsValue || typeof statsValue !== 'object') {
          return `Expected statistics configuration object`;
        }
        if (!statsValue.dataType || !statsValue.source || !statsValue.metric) {
          return `Data type, source, and metric are required`;
        }
        break;
      }

      case 'playbook': {
        const playbookValue = value as import('./WidgetSettings.types').PlaybookConfig;
        if (!playbookValue || typeof playbookValue !== 'object') {
          return `Expected playbook configuration object`;
        }
        if (!Array.isArray(playbookValue.selectedPlaybooks)) {
          return `Selected playbooks must be an array`;
        }
        break;
      }
    }

    return null;
  }

  /**
   * Get default configuration for a widget type
   */
  getDefaultConfiguration(widgetType: string): WidgetConfiguration {
    const schema = this.getSchema(widgetType);
    if (!schema) {
      return {};
    }

    const config: WidgetConfiguration = {};

    Object.entries(schema.fields).forEach(([fieldName, field]) => {
      if (field.defaultValue !== undefined) {
        config[fieldName] = field.defaultValue;
      }
    });

    return config;
  }

  /**
   * Serialize configuration to JSON string
   */
  serializeConfiguration(config: WidgetConfiguration): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Deserialize configuration from JSON string
   */
  deserializeConfiguration(data: string): WidgetConfiguration {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to deserialize configuration:', error);
      return {};
    }
  }

  /**
   * Merge configurations with defaults
   */
  mergeWithDefaults(widgetType: string, config: Partial<WidgetConfiguration>): WidgetConfiguration {
    const defaults = this.getDefaultConfiguration(widgetType);
    return {
      ...defaults,
      ...config,
    };
  }

  /**
   * Get visible fields based on dependencies
   */
  getVisibleFields(widgetType: string, config: WidgetConfiguration): string[] {
    const schema = this.getSchema(widgetType);
    if (!schema) {
      return [];
    }

    const visibleFields = Object.keys(schema.fields);

    if (schema.dependencies) {
      return visibleFields.filter(fieldName => {
        const dependency = schema.dependencies![fieldName];
        if (!dependency) {
          return true;
        }
        const dependentValue = config[dependency.dependsOn];
        return dependency.condition(dependentValue);
      });
    }

    return visibleFields;
  }
}

// Singleton instance
export const widgetSettingsManager = new WidgetSettingsManager();
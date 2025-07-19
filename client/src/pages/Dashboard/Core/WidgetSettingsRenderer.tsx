/**
 * Widget Settings Renderer
 * Automatically renders widget settings based on schema
 */

import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  DatePicker,
  Space,
  Typography,
  Collapse,
  Tabs,
} from 'antd';
import { ProFormDependency } from '@ant-design/pro-components';
import moment from 'moment';
import {
  WidgetSettingsSchema,
  WidgetConfiguration,
  SettingField,
  TextSettingField,
  NumberSettingField,
  BooleanSettingField,
  SelectSettingField,
  DateRangeSettingField,
  ColorPaletteSettingField,
  StatisticsSettingField,
  PlaybookSettingField,
  CustomSettingField,
} from './WidgetSettings.types';
import { useWidgetSettings } from './WidgetSettingsProvider';
import ColorPaletteSelector from '../Components/ColorPaletteSelector';
import StatisticsSelector from './components/StatisticsSelector';
import PlaybookSelector from './components/PlaybookSelector';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface WidgetSettingsRendererProps {
  schema: WidgetSettingsSchema;
  configuration: WidgetConfiguration;
  onChange: (updates: Partial<WidgetConfiguration>) => void;
  errors?: Record<string, string>;
}

export const WidgetSettingsRenderer: React.FC<WidgetSettingsRendererProps> = ({
  schema,
  configuration,
  onChange,
  errors = {},
}) => {
  const { getVisibleFields } = useWidgetSettings();
  const visibleFields = getVisibleFields(schema.fields, configuration);

  const renderField = (fieldName: string, field: SettingField) => {
    if (!visibleFields.includes(fieldName)) {
      return null;
    }

    const value = configuration[fieldName];
    const error = errors[fieldName];

    const commonProps = {
      name: fieldName,
      label: field.label,
      tooltip: field.description,
      rules: field.required ? [{ required: true, message: `${field.label} is required` }] : undefined,
      validateStatus: error ? 'error' : undefined,
      help: error,
    };

    switch (field.type) {
      case 'text':
        return (
          <Form.Item {...commonProps}>
            <Input
              value={value as string}
              onChange={e => onChange({ [fieldName]: e.target.value })}
              placeholder={(field as TextSettingField).placeholder}
              minLength={(field as TextSettingField).minLength}
              maxLength={(field as TextSettingField).maxLength}
            />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item {...commonProps}>
            <InputNumber
              value={value as number}
              onChange={val => onChange({ [fieldName]: val })}
              min={(field as NumberSettingField).min}
              max={(field as NumberSettingField).max}
              step={(field as NumberSettingField).step}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item {...commonProps} valuePropName="checked">
            <Switch
              checked={value as boolean}
              onChange={checked => onChange({ [fieldName]: checked })}
            />
          </Form.Item>
        );

      case 'select': {
        const selectField = field as SelectSettingField;
        return (
          <Form.Item {...commonProps}>
            <Select
              value={value}
              onChange={val => onChange({ [fieldName]: val })}
              mode={selectField.mode === 'multiple' ? 'multiple' : undefined}
              options={selectField.options}
              placeholder={`Select ${field.label.toLowerCase()}`}
            />
          </Form.Item>
        );
      }

      case 'dateRange': {
        const dateField = field as DateRangeSettingField;
        const dateValue = value as import('./WidgetSettings.types').DateRange | undefined;
        
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item {...commonProps}>
              <Select
                value={dateValue?.preset || 'last7days'}
                onChange={preset => onChange({ 
                  [fieldName]: { 
                    ...dateValue, 
                    preset: preset as import('./WidgetSettings.types').DateRange['preset'] 
                  } 
                })}
                options={dateField.presets || [
                  { label: 'Last 24 Hours', value: 'last24hours' },
                  { label: 'Last 7 Days', value: 'last7days' },
                  { label: 'Last 30 Days', value: 'last30days' },
                  { label: 'Last 3 Months', value: 'last3months' },
                  { label: 'Last 6 Months', value: 'last6months' },
                  { label: 'Last Year', value: 'lastyear' },
                  { label: 'Custom Range', value: 'custom' },
                ]}
              />
            </Form.Item>
            
            {dateValue?.preset === 'custom' && (
              <Form.Item>
                <RangePicker
                  value={dateValue.customRange ? [
                    moment(dateValue.customRange[0]),
                    moment(dateValue.customRange[1])
                  ] : undefined}
                  onChange={dates => {
                    if (dates && dates[0] && dates[1]) {
                      onChange({
                        [fieldName]: {
                          ...dateValue,
                          customRange: [dates[0], dates[1]]
                        }
                      });
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
          </Space>
        );
      }

      case 'colorPalette': {
        const colorField = field as ColorPaletteSettingField;
        const colorValue = value as import('./WidgetSettings.types').ColorPalette | undefined;
        
        return (
          <Form.Item {...commonProps}>
            <ColorPaletteSelector
              value={colorValue?.id || 'default'}
              onChange={(paletteId, customColors) => {
                onChange({
                  [fieldName]: {
                    id: paletteId as import('./WidgetSettings.types').ColorPalette['id'],
                    colors: customColors,
                  }
                });
              }}
            />
          </Form.Item>
        );
      }

      case 'statistics': {
        const statsField = field as StatisticsSettingField;
        const statsValue = value as import('./WidgetSettings.types').StatisticsConfig | undefined;
        
        return (
          <Form.Item {...commonProps}>
            <StatisticsSelector
              value={statsValue}
              onChange={val => onChange({ [fieldName]: val })}
              supportedDataTypes={statsField.supportedDataTypes}
              supportedMetrics={statsField.supportedMetrics}
            />
          </Form.Item>
        );
      }

      case 'playbook': {
        const playbookField = field as PlaybookSettingField;
        const playbookValue = value as import('./WidgetSettings.types').PlaybookConfig | undefined;
        
        return (
          <Form.Item {...commonProps}>
            <PlaybookSelector
              value={playbookValue}
              onChange={val => onChange({ [fieldName]: val })}
              maxPlaybooks={playbookField.maxPlaybooks}
              requireDeviceSelection={playbookField.requireDeviceSelection}
            />
          </Form.Item>
        );
      }

      case 'custom': {
        const customField = field as CustomSettingField;
        const Component = customField.component;
        
        return (
          <Form.Item {...commonProps}>
            <Component
              value={value}
              onChange={val => onChange({ [fieldName]: val })}
              field={customField}
            />
          </Form.Item>
        );
      }

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!schema.layout || schema.layout.type === 'default') {
      // Default layout: render all fields in order
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(schema.fields).map(([fieldName, field]) => (
            <React.Fragment key={fieldName}>
              {renderField(fieldName, field)}
            </React.Fragment>
          ))}
        </Space>
      );
    }

    if (schema.layout.type === 'sections' && schema.layout.groups) {
      // Sections layout: render fields in collapsible groups
      return (
        <Collapse defaultActiveKey={schema.layout.groups
          .filter(g => g.defaultExpanded !== false)
          .map(g => g.id)}
        >
          {schema.layout.groups.map(group => (
            <Collapse.Panel key={group.id} header={group.label}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {group.fields.map(fieldName => {
                  const field = schema.fields[fieldName];
                  return field ? (
                    <React.Fragment key={fieldName}>
                      {renderField(fieldName, field)}
                    </React.Fragment>
                  ) : null;
                })}
              </Space>
            </Collapse.Panel>
          ))}
        </Collapse>
      );
    }

    if (schema.layout.type === 'tabs' && schema.layout.groups) {
      // Tabs layout: render fields in tabs
      return (
        <Tabs
          items={schema.layout.groups.map(group => ({
            key: group.id,
            label: group.label,
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                {group.fields.map(fieldName => {
                  const field = schema.fields[fieldName];
                  return field ? (
                    <React.Fragment key={fieldName}>
                      {renderField(fieldName, field)}
                    </React.Fragment>
                  ) : null;
                })}
              </Space>
            ),
          }))}
        />
      );
    }

    return null;
  };

  return <div className="widget-settings-renderer">{renderContent()}</div>;
};
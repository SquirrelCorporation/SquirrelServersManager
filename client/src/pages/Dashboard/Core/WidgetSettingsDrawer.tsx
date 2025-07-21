/**
 * Widget Settings Drawer
 * Renders widget settings using the settings framework
 */

import React, { useCallback, useEffect } from 'react';
import { Drawer, Form, Button, Space, message, Typography, Divider } from 'antd';
import { ProForm } from '@ant-design/pro-components';
import { WidgetSettingsRenderer } from './WidgetSettingsRenderer';
import { useWidgetConfiguration, useWidgetSettings } from './WidgetSettingsProvider';
import { DashboardItem } from './DashboardWidget.types';
import { WidgetConfiguration } from './WidgetSettings.types';

interface WidgetSettingsDrawerProps {
  visible: boolean;
  widget: DashboardItem | null;
  onClose: () => void;
  onSave: (widgetId: string, configuration: WidgetConfiguration) => void;
}

export const WidgetSettingsDrawer: React.FC<WidgetSettingsDrawerProps> = ({
  visible,
  widget,
  onClose,
  onSave,
}) => {
  const { getSchema } = useWidgetSettings();
  const [form] = Form.useForm();

  // Extract widget type from widget ID (remove timestamp suffix)
  const widgetType = widget ? widget.id.split('-').slice(0, -1).join('-') : '';
  const schema = widget ? getSchema(widgetType) : undefined;

  const {
    configuration,
    validation,
    updateConfiguration,
    resetConfiguration,
    isValid,
  } = useWidgetConfiguration(widgetType, widget?.widgetSettings);

  useEffect(() => {
    if (widget) {
      // Reset form with current configuration when widget changes
      form.setFieldsValue({ settings: configuration });
    }
  }, [widget, configuration, form]);

  const handleSave = useCallback(async () => {
    if (!widget || !isValid) {
      if (validation.errors.length > 0) {
        message.error(validation.errors[0].message);
      }
      return;
    }

    try {
      await form.validateFields();
      onSave(widget.id, configuration);
      onClose();
      message.success('Widget settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error('Failed to save widget settings');
    }
  }, [widget, isValid, validation, configuration, form, onSave, onClose]);

  const handleReset = useCallback(() => {
    resetConfiguration();
    form.setFieldsValue({ settings: configuration });
  }, [resetConfiguration, configuration, form]);

  if (!widget || !schema) {
    return null;
  }

  const errors = validation.errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Drawer
      title={`${widget.title} Settings`}
      placement="right"
      width={480}
      onClose={onClose}
      open={visible}
      destroyOnClose
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleReset}>Reset</Button>
          <Button type="primary" onClick={handleSave} disabled={!isValid}>
            Apply
          </Button>
        </Space>
      }
    >
      {/* Component Name Header */}
      <div style={{ marginBottom: '24px' }}>
        <Typography.Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          {widget.title}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
          Component Type: {widgetType}
        </Typography.Text>
        <Divider style={{ margin: '16px 0' }} />
      </div>

      <Form form={form} layout="vertical">
        <Form.Item name="settings">
          <WidgetSettingsRenderer
            schema={schema}
            configuration={configuration}
            onChange={updateConfiguration}
            errors={errors}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
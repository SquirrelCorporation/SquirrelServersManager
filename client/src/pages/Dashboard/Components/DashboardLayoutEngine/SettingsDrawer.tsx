/**
 * Settings Drawer Component
 * Handles widget settings configuration
 */

import React, { useState, useEffect } from 'react';
import { Drawer, Form, Space, Spin } from 'antd';
import { ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDependency, ProFormDateRangePicker } from '@ant-design/pro-components';
import { Type, Calendar, Palette, BarChart3, Database, TrendingUp } from 'lucide-react';
import moment from 'moment';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers } from '@/services/rest/containers/containers';
import { API } from 'ssm-shared-lib';
import ColorPaletteSelector from '../ColorPaletteSelector';
import { DashboardItem, WidgetSettings } from './types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';

interface SettingsDrawerProps {
  visible: boolean;
  selectedWidget: DashboardItem | null;
  onClose: () => void;
  onSave: (widgetId: string, widgetSettings: WidgetConfiguration) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  visible,
  selectedWidget,
  onClose,
  onSave,
}) => {
  const [devices, setDevices] = useState<API.Device[]>([]);
  const [containers, setContainers] = useState<API.Container[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingContainers, setLoadingContainers] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDevicesAndContainers();
    }
  }, [visible]);

  const fetchDevicesAndContainers = async () => {
    try {
      setLoadingDevices(true);
      const devicesResponse = await getAllDevices();
      if (devicesResponse.data) {
        setDevices(devicesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoadingDevices(false);
    }

    try {
      setLoadingContainers(true);
      const containersResponse = await getContainers();
      if (containersResponse.data) {
        setContainers(containersResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch containers:', error);
    } finally {
      setLoadingContainers(false);
    }
  };

  const renderSettingsForm = () => {
    if (!selectedWidget) return null;

    // Check if widget has a custom settings component
    if (selectedWidget.settingsComponent) {
      const SettingsComponent = selectedWidget.settingsComponent;
      return (
        <ProForm
          key={`${selectedWidget.id}-${Date.now()}`}
          onFinish={async (values) => {
            const widgetSettings = values.customSettings || {};
            onSave(selectedWidget.id, widgetSettings);
            onClose();
            return true;
          }}
          submitter={{
            searchConfig: {
              submitText: 'Apply',
            },
            resetButtonProps: {
              style: { display: 'none' },
            },
            submitButtonProps: {
              style: { 
                marginTop: 20,
                width: '100%',
              },
            },
          }}
        >
          <Form.Item name="customSettings">
            <SettingsComponent 
              widgetSettings={selectedWidget.widgetSettings}
            />
          </Form.Item>
        </ProForm>
      );
    }

    const widgetSettings = selectedWidget.settings || [];
    
    if (widgetSettings.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)', padding: '40px 0' }}>
          No settings available for this widget
        </div>
      );
    }

    return (
      <ProForm
        key={`${selectedWidget.id}-${Date.now()}`}
        onFinish={async (values) => {
          const processedSettings = processFormValues(values, widgetSettings);
          onSave(selectedWidget.id, processedSettings);
          onClose();
          return true;
        }}
        submitter={{
          searchConfig: {
            submitText: 'Apply',
          },
          resetButtonProps: {
            style: { display: 'none' },
          },
          submitButtonProps: {
            style: { 
              marginTop: 20,
              width: '100%',
            },
          },
        }}
      >
        {widgetSettings.map((setting, index) => renderSettingField(setting, index))}
      </ProForm>
    );
  };

  const renderSettingField = (setting: WidgetSettings, index: number) => {
    switch (setting.type) {
      case 'statistics':
        return renderStatisticsField(setting, index);
      case 'title':
        return (
          <ProFormText
            key={index}
            name={`title_${index}`}
            label={<><Type size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{setting.label}</>}
            placeholder="Enter widget title"
            initialValue={selectedWidget?.title || setting.defaultValue || ''}
            rules={[{ required: true, message: 'Please enter a title' }]}
          />
        );
      case 'customText':
        return (
          <ProFormTextArea
            key={index}
            name={`customText_${index}`}
            label={<><Type size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{setting.label}</>}
            placeholder="Enter custom text"
            initialValue={selectedWidget?.widgetSettings?.customText || setting.defaultValue || ''}
            fieldProps={{
              rows: 4,
            }}
          />
        );
      case 'dateRange':
        return renderDateRangeField(setting, index);
      case 'colorPalette':
        return renderColorPaletteField(setting, index);
      default:
        return null;
    }
  };

  const renderStatisticsField = (setting: WidgetSettings, index: number) => (
    <div key={index} style={{ marginBottom: 24 }}>
      <ProFormSelect
        name={`statistics_type_${index}`}
        label={<><Database size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Data Type</>}
        initialValue={selectedWidget?.widgetSettings?.dataType || 'device'}
        options={[
          { label: 'Device', value: 'device' },
          { label: 'Container', value: 'container' },
        ]}
        placeholder="Select data type"
        rules={[{ required: true, message: 'Please select a data type' }]}
      />
      <ProFormDependency name={[`statistics_type_${index}`]}>
        {({ [`statistics_type_${index}`]: dataType }) => {
          const sourceOptions = getSourceOptions(dataType);
          return (
            <ProFormSelect
              name={`statistics_source_${index}`}
              label={<><BarChart3 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Source</>}
              initialValue={selectedWidget?.widgetSettings?.source || ['all']}
              options={sourceOptions}
              placeholder={dataType === 'device' ? 'Select devices' : 'Select containers'}
              mode="multiple"
              rules={[{ required: true, message: 'Please select at least one source' }]}
              fieldProps={{
                loading: dataType === 'device' ? loadingDevices : loadingContainers,
              }}
            />
          );
        }}
      </ProFormDependency>
      <ProFormDependency name={[`statistics_type_${index}`]}>
        {({ [`statistics_type_${index}`]: dataType }) => {
          const metrics = getMetricOptions(dataType);
          return (
            <ProFormSelect
              name={`statistics_metric_${index}`}
              label={<><TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Metric</>}
              initialValue={selectedWidget?.widgetSettings?.metric || 'cpu_usage'}
              options={metrics}
              placeholder="Select metric"
              rules={[{ required: true, message: 'Please select a metric' }]}
            />
          );
        }}
      </ProFormDependency>
    </div>
  );

  const renderDateRangeField = (setting: WidgetSettings, index: number) => (
    <React.Fragment key={index}>
      <ProFormSelect
        name={`dateRangePreset_${index}`}
        label={<><Calendar size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Date Range</>}
        initialValue={selectedWidget?.widgetSettings?.dateRangePreset || 'last7days'}
        options={[
          { label: 'Last 24 Hours', value: 'last24hours' },
          { label: 'Last 7 Days', value: 'last7days' },
          { label: 'Last 30 Days', value: 'last30days' },
          { label: 'Last 3 Months', value: 'last3months' },
          { label: 'Last 6 Months', value: 'last6months' },
          { label: 'Last Year', value: 'lastyear' },
          { label: 'Custom Range', value: 'custom' },
        ]}
        placeholder="Select date range"
      />
      <ProFormDependency name={[`dateRangePreset_${index}`]}>
        {({ [`dateRangePreset_${index}`]: preset }) => {
          if (preset === 'custom') {
            return (
              <ProFormDateRangePicker
                name={`customDateRange_${index}`}
                label={<><Calendar size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Custom Date Range</>}
                initialValue={selectedWidget?.widgetSettings?.customDateRange || [
                  moment().subtract(7, 'days'),
                  moment()
                ]}
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
              />
            );
          }
          return null;
        }}
      </ProFormDependency>
    </React.Fragment>
  );

  const renderColorPaletteField = (setting: WidgetSettings, index: number) => (
    <ProFormDependency key={index} name={[]}>
      {(_, form) => (
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: 'rgba(0, 0, 0, 0.85)', fontSize: 14, fontWeight: 500 }}>
              <Palette size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Colors
            </span>
          </div>
          <ColorPaletteSelector
            value={selectedWidget?.widgetSettings?.colorPalette || 'default'}
            onChange={(paletteId, customColors) => {
              form.setFieldsValue({
                [`colorPalette_${index}`]: paletteId,
                [`customColors_${index}`]: JSON.stringify(customColors || [])
              });
            }}
          />
          <ProFormText
            name={`colorPalette_${index}`}
            hidden
            initialValue={selectedWidget?.widgetSettings?.colorPalette || 'default'}
          />
          <ProFormText
            name={`customColors_${index}`}
            hidden
            initialValue={JSON.stringify(selectedWidget?.widgetSettings?.customColors || [])}
          />
        </div>
      )}
    </ProFormDependency>
  );

  const getSourceOptions = (dataType: string) => {
    let options = [{ label: 'All', value: 'all' }];
    
    if (dataType === 'device') {
      options = [
        { label: 'All Devices', value: 'all' },
        ...devices.map(device => ({
          label: device.fqdn || device.ip || device.uuid,
          value: device.uuid,
        }))
      ];
    } else if (dataType === 'container') {
      options = [
        { label: 'All Containers', value: 'all' },
        ...containers.map(container => ({
          label: container.customName || container.name || container.id,
          value: container.id,
        }))
      ];
    }
    
    return options;
  };

  const getMetricOptions = (dataType: string) => {
    const deviceMetrics = [
      { label: 'CPU Usage', value: 'cpu_usage' },
      { label: 'Memory Usage', value: 'memory_usage' },
      { label: 'Memory Free', value: 'memory_free' },
      { label: 'Storage Usage', value: 'storage_usage' },
      { label: 'Storage Free', value: 'storage_free' },
      { label: 'Containers', value: 'containers' },
    ];
    
    const containerMetrics = [
      { label: 'CPU Usage', value: 'container_cpu_usage' },
      { label: 'Memory Usage', value: 'container_memory_usage' },
    ];
    
    return dataType === 'device' ? deviceMetrics : 
           dataType === 'container' ? containerMetrics : 
           [...deviceMetrics, ...containerMetrics];
  };

  const processFormValues = (values: any, widgetSettings: WidgetSettings[]) => {
    const processed: WidgetConfiguration = {};
    
    Object.keys(values).forEach(key => {
      if (key.includes('statistics_type_')) {
        processed.dataType = values[key];
      } else if (key.includes('statistics_source_')) {
        processed.source = values[key];
      } else if (key.includes('statistics_metric_')) {
        processed.metric = values[key];
      } else if (key.includes('title_')) {
        processed.title = values[key];
      } else if (key.includes('dateRangePreset_')) {
        processed.dateRangePreset = values[key];
      } else if (key.includes('customDateRange_')) {
        processed.customDateRange = values[key];
      } else if (key.includes('customText_')) {
        processed.customText = values[key];
      } else if (key.includes('colorPalette_')) {
        processed.colorPalette = values[key];
      } else if (key.includes('customColors_')) {
        try {
          processed.customColors = JSON.parse(values[key]);
        } catch {
          processed.customColors = [];
        }
      }
    });
    
    return processed;
  };

  return (
    <Drawer
      title="Widget Settings"
      placement="right"
      width={480}
      onClose={onClose}
      open={visible}
      destroyOnClose={true}
    >
      {renderSettingsForm()}
    </Drawer>
  );
};

export default SettingsDrawer;
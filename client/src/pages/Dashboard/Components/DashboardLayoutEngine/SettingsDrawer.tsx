/**
 * Settings Drawer Component
 * Handles widget settings configuration
 */

import React, { useState, useEffect } from 'react';
import { Drawer, Form, Space, Spin, Card, Switch } from 'antd';
import { ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDependency, ProFormDateRangePicker, ProFormSwitch } from '@ant-design/pro-components';
import { FontSizeOutlined, CalendarOutlined, BgColorsOutlined, BarChartOutlined, DatabaseOutlined, LineChartOutlined, SettingOutlined } from '@ant-design/icons';
import moment from 'moment';
import { widgetLogger } from '@/utils/logger';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers } from '@/services/rest/containers/containers';
import { API } from 'ssm-shared-lib';
import ColorPaletteSelector from '../ColorPaletteSelector';
import { DashboardItem, WidgetSettings } from './types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { WIDGET_FIELDS, WIDGET_DEFAULTS, DATA_TYPES, METRICS, DATE_RANGE_PRESETS, BACKGROUND_THEMES } from '../../constants/widgetConstants';

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
      widgetLogger.error('Failed to fetch devices', error);
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
      widgetLogger.error('Failed to fetch containers', error);
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
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <SettingOutlined style={{ 
            fontSize: '48px',
            opacity: 0.3
          }} />
          <div style={{
            fontSize: '16px',
            fontWeight: 500
          }}>
            No settings available
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.6
          }}>
            This widget doesn't have any configurable options
          </div>
        </div>
      );
    }

    // Organize settings by type for better layout
    const titleSettings = widgetSettings.filter(s => s.type === 'title' || s.type === 'customText');
    const statisticsSettings = widgetSettings.filter(s => s.type === 'statistics');
    const dateRangeSettings = widgetSettings.filter(s => s.type === 'dateRange');
    const colorSettings = widgetSettings.filter(s => s.type === 'colorPalette');
    const backgroundColorSettings = widgetSettings.filter(s => s.type === 'backgroundColor');
    
    return (
      <ProForm
        key={`${selectedWidget.id}-${Date.now()}`}
        onFinish={async (values) => {
          const processedSettings = processFormValues(values, widgetSettings);
          widgetLogger.info('Form submission', {
            widgetId: selectedWidget.id,
            formValues: values,
            processedSettings
          });
          alert('Widget Settings Being Saved:\n' + JSON.stringify(processedSettings, null, 2));
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
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Title Settings - Always first when present */}
          {titleSettings.length > 0 && (
            <Card size="small" style={{ marginBottom: 16 }}>
              {titleSettings.map((setting, index) => renderSettingField(setting, widgetSettings.indexOf(setting)))}
            </Card>
          )}
          
          {/* Metrics Settings */}
          {(statisticsSettings.length > 0 || dateRangeSettings.length > 0) && (
            <Card size="small" style={{ marginBottom: 16 }}>
              {statisticsSettings.map((setting, index) => renderSettingField(setting, widgetSettings.indexOf(setting)))}
              {dateRangeSettings.map((setting, index) => renderSettingField(setting, widgetSettings.indexOf(setting)))}
            </Card>
          )}
          
          {/* Color Theme */}
          {(colorSettings.length > 0 || backgroundColorSettings.length > 0) && (
            <Card size="small" style={{ marginBottom: 16 }}>
              {colorSettings.map((setting, index) => renderSettingField(setting, widgetSettings.indexOf(setting)))}
              {backgroundColorSettings.map((setting, index) => renderSettingField(setting, widgetSettings.indexOf(setting)))}
            </Card>
          )}
        </Space>
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
            label={<><FontSizeOutlined style={{ marginRight: 6 }} />{setting.label}</>}
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
            label={<><FontSizeOutlined style={{ marginRight: 6 }} />{setting.label}</>}
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
      case 'backgroundColor':
        return renderBackgroundColorField(setting, index);
      default:
        return null;
    }
  };

  const renderStatisticsField = (setting: WidgetSettings, index: number) => (
    <div key={index} style={{ marginBottom: 24 }}>
      <ProFormSelect
        name={`statistics_type_${index}`}
        label={<><DatabaseOutlined style={{ marginRight: 6 }} />Data Type</>}
        initialValue={selectedWidget?.widgetSettings?.[WIDGET_FIELDS.STATISTICS_TYPE] || WIDGET_DEFAULTS.DATA_TYPE}
        options={[
          { label: 'Device', value: DATA_TYPES.DEVICE },
          { label: 'Container', value: DATA_TYPES.CONTAINER },
        ]}
        placeholder="Select data type"
        rules={[{ required: true, message: 'Please select a data type' }]}
      />
      <ProFormDependency name={[`statistics_type_${index}`]}>
        {({ [`statistics_type_${index}`]: dataType }) => {
          const sourceOptions = getSourceOptions(dataType, false); // Don't include 'all' option
          // Use only statistics_source field
          const currentSource = selectedWidget?.widgetSettings?.[WIDGET_FIELDS.STATISTICS_SOURCE];
          widgetLogger.debug('Widget settings source check', {
            widgetId: selectedWidget?.id,
            currentSource,
            widgetSettings: selectedWidget?.widgetSettings
          });
          const isAllSelected = Array.isArray(currentSource) 
            ? currentSource.includes('all')
            : currentSource === 'all' || !currentSource;
          
          return (
            <div>
              <ProFormSwitch
                name={`statistics_all_${index}`}
                label={<><BarChartOutlined style={{ marginRight: 6 }} />{dataType === 'device' ? 'All Devices' : 'All Containers'}</>}
                initialValue={isAllSelected}
                fieldProps={{
                  onChange: (checked, form = arguments[1]) => {
                    if (checked) {
                      // When toggled on, clear specific selections
                      form?.setFieldsValue?.({
                        [`statistics_source_${index}`]: []
                      });
                    }
                  }
                }}
              />
              <ProFormDependency name={[`statistics_all_${index}`]}>
                {({ [`statistics_all_${index}`]: allSelected }) => {
                  if (!allSelected) {
                    return (
                      <ProFormSelect
                        name={`statistics_source_${index}`}
                        label={<><BarChartOutlined style={{ marginRight: 6 }} />Specific Sources</>}
                        initialValue={
                          isAllSelected 
                            ? [] 
                            : Array.isArray(currentSource) 
                              ? currentSource.filter(s => s !== 'all')
                              : currentSource && currentSource !== 'all' 
                                ? [currentSource] 
                                : []
                        }
                        options={sourceOptions}
                        placeholder={dataType === 'device' ? 'Select specific devices' : 'Select specific containers'}
                        mode={setting.selectionMode === 'single' ? undefined : "multiple"}
                        rules={[{ required: true, message: 'Please select at least one source' }]}
                        fieldProps={{
                          loading: dataType === 'device' ? loadingDevices : loadingContainers,
                        }}
                      />
                    );
                  }
                  return null;
                }}
              </ProFormDependency>
            </div>
          );
        }}
      </ProFormDependency>
      <ProFormDependency name={[`statistics_type_${index}`]}>
        {({ [`statistics_type_${index}`]: dataType }) => {
          const metrics = getMetricOptions(dataType);
          return (
            <ProFormSelect
              name={`statistics_metric_${index}`}
              label={<><LineChartOutlined style={{ marginRight: 6 }} />Metric</>}
              initialValue={selectedWidget?.widgetSettings?.[WIDGET_FIELDS.STATISTICS_METRIC] || WIDGET_DEFAULTS.METRIC}
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
        label={<><CalendarOutlined style={{ marginRight: 6 }} />Date Range</>}
        initialValue={selectedWidget?.widgetSettings?.[WIDGET_FIELDS.DATE_RANGE_PRESET] || WIDGET_DEFAULTS.DATE_RANGE}
        options={[
          { label: 'Last 24 Hours', value: DATE_RANGE_PRESETS.LAST_24_HOURS },
          { label: 'Last 7 Days', value: DATE_RANGE_PRESETS.LAST_7_DAYS },
          { label: 'Last 30 Days', value: DATE_RANGE_PRESETS.LAST_30_DAYS },
          { label: 'Last 3 Months', value: DATE_RANGE_PRESETS.LAST_3_MONTHS },
          { label: 'Last 6 Months', value: DATE_RANGE_PRESETS.LAST_6_MONTHS },
          { label: 'Last Year', value: DATE_RANGE_PRESETS.LAST_YEAR },
          { label: 'Custom Range', value: DATE_RANGE_PRESETS.CUSTOM },
        ]}
        placeholder="Select date range"
      />
      <ProFormDependency name={[`dateRangePreset_${index}`]}>
        {({ [`dateRangePreset_${index}`]: preset }) => {
          if (preset === 'custom') {
            return (
              <ProFormDateRangePicker
                name={`customDateRange_${index}`}
                label={<><CalendarOutlined style={{ marginRight: 6 }} />Custom Date Range</>}
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

  const renderBackgroundColorField = (setting: WidgetSettings, index: number) => (
    <ProFormSelect
      key={index}
      name={`backgroundColor_${index}`}
      label={<><BgColorsOutlined style={{ marginRight: 6 }} />{setting.label}</>}
      initialValue={selectedWidget?.widgetSettings?.[WIDGET_FIELDS.BACKGROUND_COLOR_PALETTE] || setting.defaultValue || WIDGET_DEFAULTS.COLOR_PALETTE}
      options={[
        { label: 'Default Theme', value: BACKGROUND_THEMES.DEFAULT },
        { label: 'Primary Blue', value: BACKGROUND_THEMES.PRIMARY },
        { label: 'Success Green', value: BACKGROUND_THEMES.SUCCESS },
        { label: 'Warning Orange', value: BACKGROUND_THEMES.WARNING },
        { label: 'Error Red', value: BACKGROUND_THEMES.ERROR },
        { label: 'Light Gray', value: BACKGROUND_THEMES.LIGHT },
        { label: 'Dark Theme', value: BACKGROUND_THEMES.DARK },
        { label: 'Purple Gradient', value: BACKGROUND_THEMES.PURPLE },
        { label: 'Ocean Blue', value: BACKGROUND_THEMES.OCEAN },
        { label: 'Sunset Orange', value: BACKGROUND_THEMES.SUNSET },
      ]}
      placeholder="Select background color theme"
    />
  );

  const getSourceOptions = (dataType: string, includeAll: boolean = true) => {
    let options: Array<{ label: string; value: string }> = [];
    
    if (dataType === 'device') {
      options = devices.map(device => ({
        label: device.fqdn || device.ip || device.uuid,
        value: device.uuid,
      }));
      if (includeAll) {
        options.unshift({ label: 'All Devices', value: 'all' });
      }
    } else if (dataType === 'container') {
      options = containers.map(container => ({
        label: container.customName || container.name || container.id,
        value: container.id,
      }));
      if (includeAll) {
        options.unshift({ label: 'All Containers', value: 'all' });
      }
    } else if (includeAll) {
      options = [{ label: 'All', value: 'all' }];
    }
    
    return options;
  };

  const getMetricOptions = (dataType: string) => {
    const deviceMetrics = [
      { label: 'CPU Usage', value: METRICS.CPU_USAGE },
      { label: 'Memory Usage', value: METRICS.MEMORY_USAGE },
      { label: 'Memory Free', value: METRICS.MEMORY_FREE },
      { label: 'Storage Usage', value: METRICS.STORAGE_USAGE },
      { label: 'Storage Free', value: METRICS.STORAGE_FREE },
      { label: 'Containers', value: METRICS.CONTAINERS },
    ];
    
    const containerMetrics = [
      { label: 'CPU Usage', value: METRICS.CONTAINER_CPU_USAGE },
      { label: 'Memory Usage', value: METRICS.CONTAINER_MEMORY_USAGE },
    ];
    
    return dataType === DATA_TYPES.DEVICE ? deviceMetrics : 
           dataType === DATA_TYPES.CONTAINER ? containerMetrics : 
           [...deviceMetrics, ...containerMetrics];
  };

  const processFormValues = (values: any, widgetSettings: WidgetSettings[]) => {
    const processed: WidgetConfiguration = {};
    
    Object.keys(values).forEach(key => {
      if (key.includes('statistics_type_')) {
        processed[WIDGET_FIELDS.STATISTICS_TYPE] = values[key];
      } else if (key.includes('statistics_all_')) {
        // Handle the "all" toggle
        const isAllSelected = values[key];
        if (isAllSelected) {
          processed[WIDGET_FIELDS.STATISTICS_SOURCE] = WIDGET_DEFAULTS.ALL_SOURCES;
        }
      } else if (key.includes('statistics_source_')) {
        // Only use specific sources if "all" is not selected
        const allKey = key.replace('statistics_source_', 'statistics_all_');
        const isAllSelected = values[allKey];
        if (!isAllSelected && values[key]?.length > 0) {
          processed[WIDGET_FIELDS.STATISTICS_SOURCE] = values[key];
        }
      } else if (key.includes('statistics_metric_')) {
        processed[WIDGET_FIELDS.STATISTICS_METRIC] = values[key];
      } else if (key.includes('title_')) {
        processed[WIDGET_FIELDS.TITLE] = values[key];
      } else if (key.includes('dateRangePreset_')) {
        processed[WIDGET_FIELDS.DATE_RANGE_PRESET] = values[key];
      } else if (key.includes('customDateRange_')) {
        processed[WIDGET_FIELDS.CUSTOM_DATE_RANGE] = values[key];
      } else if (key.includes('customText_')) {
        processed[WIDGET_FIELDS.CUSTOM_TEXT] = values[key];
      } else if (key.includes('colorPalette_')) {
        processed[WIDGET_FIELDS.COLOR_PALETTE] = values[key];
      } else if (key.includes('customColors_')) {
        try {
          processed[WIDGET_FIELDS.CUSTOM_COLORS] = JSON.parse(values[key]);
        } catch {
          processed[WIDGET_FIELDS.CUSTOM_COLORS] = WIDGET_DEFAULTS.EMPTY_ARRAY;
        }
      } else if (key.includes('backgroundColor_')) {
        processed[WIDGET_FIELDS.BACKGROUND_COLOR_PALETTE] = values[key];
      }
    });
    
    // Don't set a default source - let the widget handle it
    
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
      {/* Debug Overlay */}
      {selectedWidget && (
        <div style={{
          background: '#1f1f1f',
          border: '1px solid #ff0000',
          borderRadius: 4,
          padding: 12,
          marginBottom: 16,
          fontSize: 11,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: 200,
          overflow: 'auto'
        }}>
          <div style={{ color: '#ff6b6b', marginBottom: 8, fontWeight: 'bold' }}>
            🐛 DEBUG: Raw Widget Settings
          </div>
          <div style={{ color: '#40a9ff' }}>
            {JSON.stringify(selectedWidget.widgetSettings, null, 2)}
          </div>
        </div>
      )}
      {renderSettingsForm()}
    </Drawer>
  );
};

export default SettingsDrawer;
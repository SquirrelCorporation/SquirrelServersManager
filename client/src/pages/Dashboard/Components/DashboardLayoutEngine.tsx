import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Layout, Card, Button, Drawer, Space, Row, Col, Tooltip, Switch, Form, Select, Input, ColorPicker, Popconfirm, message, Spin } from 'antd';
import { PlusOutlined, DragOutlined, EditOutlined, EyeOutlined, SettingOutlined, DashboardOutlined, BarChartOutlined, UserOutlined, SettingOutlined as SettingIcon, DeleteOutlined } from '@ant-design/icons';
import { ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDependency, ProFormDateRangePicker } from '@ant-design/pro-components';
import moment from 'moment';
import DndProvider from './DndProvider';
import dashboardService from '@/services/rest/dashboard.service';
import type { Dashboard, DashboardWidget } from '@/services/rest/dashboard.service';
import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers } from '@/services/rest/containers/containers';
import type { API } from 'ssm-shared-lib';

// Types
export type DashboardItemSize = 'small' | 'medium' | 'large' | 'wide' | 'full';

export type SettingType = 'statistics' | 'icon' | 'backgroundColor' | 'title' | 'customText' | 'dateRange';

export interface WidgetSettings {
  type: SettingType;
  label: string;
  defaultValue?: any;
}

export interface DashboardItem {
  id: string;
  component: React.ReactNode;
  size: DashboardItemSize;
  title: string;
  settings?: WidgetSettings[];
  componentFactory?: (widgetSettings?: any) => React.ReactNode;
  widgetSettings?: any; // Store the configured settings
}

// Size configuration
export const sizeToColSpan: Record<DashboardItemSize, number> = {
  small: 8, // 1/3 of row
  medium: 12, // 1/2 of row
  large: 16, // 2/3 of row
  wide: 24, // full width
  full: 24, // full width
};

// Size to min height for visualization
export const sizeToMinHeight: Record<DashboardItemSize, number> = {
  small: 200,
  medium: 250,
  large: 300,
  wide: 350,
  full: 400,
};

// Draggable Item Component
interface DraggableItemProps {
  id: string;
  index: number;
  children: React.ReactNode;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  isEditMode: boolean;
  onSettings?: () => void;
  onRemove?: () => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, index, children, moveItem, isEditMode, onSettings, onRemove }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'DASHBOARD_ITEM',
    item: { id, index },
    canDrag: isEditMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'DASHBOARD_ITEM',
    canDrop: () => isEditMode,
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditMode ? 'move' : 'default',
        position: 'relative'
      }}
    >
      {isEditMode && (
        <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 10, display: 'flex', gap: 8 }}>
          <Tooltip title="Widget settings">
            <Button 
              size="small" 
              icon={<SettingOutlined />} 
              onClick={onSettings}
              style={{ opacity: 0.7 }}
            />
          </Tooltip>
          <Popconfirm
            title="Remove widget"
            description="Are you sure you want to remove this widget?"
            onConfirm={onRemove}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Remove widget">
              <Button 
                size="small" 
                icon={<DeleteOutlined />} 
                danger
                style={{ opacity: 0.7 }}
              />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Drag to rearrange">
            <DragOutlined style={{ color: 'rgba(0,0,0,0.45)', fontSize: 20 }} />
          </Tooltip>
        </div>
      )}
      {children}
    </div>
  );
};

// Dashboard Layout Engine
interface DashboardLayoutEngineProps {
  availableItems: DashboardItem[];
}

const DashboardLayoutEngine: React.FC<DashboardLayoutEngineProps> = ({ availableItems }) => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('default-page');
  const [devices, setDevices] = useState<API.Device[]>([]);
  const [containers, setContainers] = useState<API.Container[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingContainers, setLoadingContainers] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (updatedItems: DashboardItem[]) => {
    if (!currentDashboard) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout for debounced saving
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        
        // Convert items to DashboardWidget format
        const widgets: DashboardWidget[] = updatedItems.map((item, index) => {
          // Extract the base widget type - handle IDs like "welcome-header-1234567890"
          const parts = item.id.split('-');
          const timestamp = parts[parts.length - 1];
          const widgetType = item.id.replace(`-${timestamp}`, '');
          
          return {
            id: item.id,
            widgetType: widgetType,
            title: item.title,
            size: item.size,
            position: index,
            settings: item.widgetSettings ? {
              // Map our internal format to the backend format
              statistics_type: item.widgetSettings.dataType,
              statistics_source: item.widgetSettings.source,
              statistics_metric: item.widgetSettings.metric,
              title: item.title,
              dateRangePreset: item.widgetSettings.dateRangePreset,
              customDateRange: item.widgetSettings.customDateRange,
              // Include any other settings
              ...Object.keys(item.widgetSettings).reduce((acc, key) => {
                if (!['dataType', 'source', 'metric', 'title', 'dateRangePreset', 'customDateRange'].includes(key)) {
                  acc[key] = item.widgetSettings[key];
                }
                return acc;
              }, {} as any),
            } : item.settings ? {
              // Map settings from form values
              title: item.title,
              // Add other settings as needed
            } : undefined,
          };
        });
        
        await dashboardService.updateWidgets(
          currentDashboard._id!,
          currentPageId,
          widgets
        );
        
        // Silent save - no success message for auto-save
      } catch (error) {
        console.error('Auto-save failed:', error);
        message.error('Failed to save dashboard changes');
      } finally {
        setSaving(false);
      }
    }, 1000); // 1 second debounce
  }, [currentDashboard, currentPageId]);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const dragItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, dragItem);
      
      // Auto-save after reordering
      autoSave(newItems);
      
      return newItems;
    });
  }, [autoSave]);

  const addItem = useCallback((item: DashboardItem) => {
    setItems((prevItems) => {
      const newItems = [...prevItems, item];
      // Auto-save after adding
      autoSave(newItems);
      return newItems;
    });
    setDrawerVisible(false);
  }, [autoSave]);

  const fetchDevicesAndContainers = useCallback(async () => {
    try {
      // Fetch devices
      setLoadingDevices(true);
      const devicesResponse = await getAllDevices();
      if (devicesResponse.data) {
        setDevices(devicesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      message.error('Failed to load devices');
    } finally {
      setLoadingDevices(false);
    }

    try {
      // Fetch containers
      setLoadingContainers(true);
      const containersResponse = await getContainers();
      if (containersResponse.data) {
        setContainers(containersResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch containers:', error);
      message.error('Failed to load containers');
    } finally {
      setLoadingContainers(false);
    }
  }, []);

  const handleWidgetSettings = useCallback((widgetId: string) => {
    setSelectedWidgetId(widgetId);
    setSettingsDrawerVisible(true);
    // Fetch devices and containers when opening settings
    fetchDevicesAndContainers();
  }, [fetchDevicesAndContainers]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      // Auto-save after removing
      autoSave(newItems);
      return newItems;
    });
  }, [autoSave]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboard = await dashboardService.getCurrentDashboard();
      setCurrentDashboard(dashboard);
      
      // Find the default page or first page
      const defaultPage = dashboard.pages.find(p => p.isDefault) || dashboard.pages[0];
      if (defaultPage) {
        setCurrentPageId(defaultPage.id);
        
        // Convert saved widgets to DashboardItems
        const loadedItems = defaultPage.widgets.map(widget => {
          const availableItem = availableItems.find(item => item.id === widget.widgetType);
          if (availableItem) {
            // Convert backend settings format to our internal format
            const widgetSettings = widget.settings ? {
              dataType: widget.settings.statistics_type || 'device',
              source: widget.settings.statistics_source || ['all'],
              metric: widget.settings.statistics_metric || 'cpu_usage',
              title: widget.settings.title,
              dateRangePreset: widget.settings.dateRangePreset || 'last7days',
              customDateRange: widget.settings.customDateRange,
              // Include any other settings
              ...Object.keys(widget.settings).reduce((acc, key) => {
                if (!['statistics_type', 'statistics_source', 'statistics_metric', 'title', 'dateRangePreset', 'customDateRange'].includes(key)) {
                  acc[key] = widget.settings![key];
                }
                return acc;
              }, {} as any),
            } : undefined;
            
            // If the widget has settings and a componentFactory, recreate the component
            const component = availableItem.componentFactory && widgetSettings
              ? availableItem.componentFactory(widgetSettings)
              : availableItem.component;
            
            return {
              ...availableItem,
              id: widget.id,
              title: widget.settings?.title || widget.title || availableItem.title,
              widgetSettings: widgetSettings,
              component: component,
            };
          }
          return null;
        }).filter(Boolean) as DashboardItem[];
        
        setItems(loadedItems);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      message.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [availableItems]);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
    
    // Cleanup function to clear timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [loadDashboard]);


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <DndProvider>
      <Layout>
        <Layout.Content style={{ padding: isEditMode ? '24px' : '0', minHeight: '600px' }}>
          {isEditMode ? (
            <Card 
              title={
                <Space>
                  <span>Customizable Dashboard</span>
                  <Switch
                    checkedChildren={<EditOutlined />}
                    unCheckedChildren={<EyeOutlined />}
                    checked={isEditMode}
                    onChange={setIsEditMode}
                  />
                  <span style={{ fontSize: 14, fontWeight: 'normal', marginLeft: 8 }}>
                    Edit Mode
                  </span>
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setDrawerVisible(true)}
                  >
                    Add Widget
                  </Button>
                  {saving && (
                    <span style={{ color: '#1890ff', fontSize: 12 }}>
                      <Spin size="small" style={{ marginRight: 8 }} />
                      Saving...
                    </span>
                  )}
                </Space>
              }
            >
              <Row gutter={[24, 24]}>
                {items.map((item, index) => (
                <Col 
                  key={item.id} 
                  xs={24} 
                  lg={sizeToColSpan[item.size]}
                >
                  <DraggableItem
                    id={item.id}
                    index={index}
                    moveItem={moveItem}
                    isEditMode={isEditMode}
                    onSettings={() => handleWidgetSettings(item.id)}
                    onRemove={() => removeItem(item.id)}
                  >
                    {isEditMode ? (
                      <Card 
                        title={item.title}
                        style={{
                          minHeight: sizeToMinHeight[item.size],
                          height: '100%'
                        }}
                      >
                        {item.component}
                      </Card>
                    ) : (
                      <div style={{ height: '100%' }}>
                        {item.component}
                      </div>
                    )}
                  </DraggableItem>
                </Col>
              ))}
              </Row>
              {items.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '100px 0', 
                  color: 'rgba(0, 0, 0, 0.45)', 
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '4px'
                }}>
                  <p>No widgets added yet. Click "Add Widget" to customize your dashboard.</p>
                </div>
              )}
            </Card>
          ) : (
            <>
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Switch
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren={<EyeOutlined />}
                  checked={isEditMode}
                  onChange={setIsEditMode}
                />
                <span style={{ marginLeft: 8 }}>View Mode</span>
              </div>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {(() => {
                  // Group widgets for proper layout in view mode
                  const welcomeHeader = items.find(item => item.id.includes('welcome-header'));
                  const tipsOfDay = items.find(item => item.id.includes('tips-of-the-day'));
                  const otherWidgets = items.filter(item => 
                    !item.id.includes('welcome-header') && !item.id.includes('tips-of-the-day')
                  );
                  
                  return (
                    <>
                      {/* First row: Welcome Header and Tips */}
                      {(welcomeHeader || tipsOfDay) && (
                        <Row gutter={[24, 24]}>
                          {welcomeHeader && (
                            <Col xs={24} lg={16}>
                              {welcomeHeader.component}
                            </Col>
                          )}
                          {tipsOfDay && (
                            <Col xs={24} lg={8}>
                              {tipsOfDay.component}
                            </Col>
                          )}
                        </Row>
                      )}
                      
                      {/* Other widgets in their normal layout */}
                      <Row gutter={[24, 24]}>
                        {otherWidgets.map((item) => (
                          <Col 
                            key={item.id} 
                            xs={24} 
                            lg={sizeToColSpan[item.size]}
                          >
                            {item.component}
                          </Col>
                        ))}
                      </Row>
                    </>
                  );
                })()}
              </Space>
              {items.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '100px 0', 
                  color: 'rgba(0, 0, 0, 0.45)'
                }}>
                  <p>No widgets added yet. Switch to Edit Mode to customize your dashboard.</p>
                </div>
              )}
            </>
          )}
        </Layout.Content>

        <Drawer
          title="Available Widgets"
          placement="right"
          width={400}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {availableItems.map((item) => (
              <Card 
                key={item.id}
                hoverable
                size="small"
                title={item.title}
                onClick={() => addItem({...item, id: `${item.id}-${Date.now()}`})}
                style={{ marginBottom: 16, cursor: 'pointer' }}
                extra={
                  <Tooltip title={`Size: ${item.size}`}>
                    <span style={{ 
                      fontSize: 10, 
                      padding: '2px 6px', 
                      background: '#f0f0f0', 
                      borderRadius: 2,
                      color: '#666'
                    }}>
                      {item.size.toUpperCase()}
                    </span>
                  </Tooltip>
                }
                bodyStyle={{ padding: 12 }}
              >
                <div style={{ 
                  height: '100px', 
                  overflow: 'hidden',
                  position: 'relative',
                  borderRadius: 4
                }}>
                  <div style={{
                    transform: 'scale(0.25)',
                    transformOrigin: 'top left',
                    width: '400%',
                    pointerEvents: 'none'
                  }}>
                    {item.component}
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </Drawer>

        <Drawer
          title="Widget Settings"
          placement="right"
          width={480}
          onClose={() => setSettingsDrawerVisible(false)}
          open={settingsDrawerVisible}
        >
          {(() => {
            const selectedWidget = items.find(item => item.id === selectedWidgetId);
            const widgetSettings = selectedWidget?.settings || [];
            
            if (widgetSettings.length === 0) {
              return (
                <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)', padding: '40px 0' }}>
                  No settings available for this widget
                </div>
              );
            }
            
            return (
              <ProForm
                onFinish={async (values) => {
                  // Process the form values to extract widget settings
                  const widgetSettings: any = {};
                  
                  // Extract statistics settings
                  Object.keys(values).forEach(key => {
                    if (key.includes('statistics_type_')) {
                      widgetSettings.dataType = values[key];
                    } else if (key.includes('statistics_source_')) {
                      widgetSettings.source = values[key];
                    } else if (key.includes('statistics_metric_')) {
                      widgetSettings.metric = values[key];
                    } else if (key.includes('title_')) {
                      widgetSettings.title = values[key];
                    } else if (key.includes('dateRangePreset_')) {
                      widgetSettings.dateRangePreset = values[key];
                    } else if (key.includes('customDateRange_')) {
                      widgetSettings.customDateRange = values[key];
                    } else if (key.includes('aggregationType_')) {
                      widgetSettings.aggregationType = values[key];
                    }
                  });
                  
                  // Update the widget settings in items
                  setItems((prevItems) => {
                    const newItems = prevItems.map(item => {
                      if (item.id === selectedWidgetId) {
                        // Find the original item in availableItems to get componentFactory
                        const originalItem = availableItems.find(avItem => 
                          item.id.startsWith(avItem.id.split('-')[0])
                        );
                        
                        // If the item has a componentFactory, use it to create a new component
                        if (originalItem?.componentFactory) {
                          return {
                            ...item,
                            widgetSettings,
                            component: originalItem.componentFactory(widgetSettings),
                            title: widgetSettings.title || item.title,
                          };
                        }
                        
                        return {
                          ...item,
                          widgetSettings,
                          title: widgetSettings.title || item.title,
                        };
                      }
                      return item;
                    });
                    
                    // Auto-save after updating settings
                    autoSave(newItems);
                    
                    return newItems;
                  });
                  
                  setSettingsDrawerVisible(false);
                  return true;
                }}
                submitter={{
                  searchConfig: {
                    submitText: 'Apply',
                  },
                  resetButtonProps: {
                    style: { display: 'none' },
                  },
                }}
              >
                {widgetSettings.map((setting, index) => (
                  <div key={index} style={{ marginBottom: 24 }}>
                    {setting.type === 'statistics' && (
                      <>
                        <h4 style={{ marginBottom: 16 }}>{setting.label}</h4>
                        <ProFormSelect
                          name={`statistics_type_${index}`}
                          label="Data Type"
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
                            
                            return (
                              <ProFormSelect
                                name={`statistics_source_${index}`}
                                label="Source"
                                initialValue={selectedWidget?.widgetSettings?.source || ['all']}
                                options={options}
                                placeholder={dataType === 'device' ? 'Select devices' : dataType === 'container' ? 'Select containers' : 'Select source'}
                                mode="multiple"
                                rules={[{ required: true, message: 'Please select at least one source' }]}
                                fieldProps={{
                                  loading: dataType === 'device' ? loadingDevices : dataType === 'container' ? loadingContainers : false,
                                }}
                              />
                            );
                          }}
                        </ProFormDependency>
                        <ProFormDependency name={[`statistics_type_${index}`]}>
                          {({ [`statistics_type_${index}`]: dataType }) => {
                            // Define metrics based on data type - using actual backend metric values
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
                            
                            const metrics = dataType === 'device' ? deviceMetrics : 
                                          dataType === 'container' ? containerMetrics : 
                                          [...deviceMetrics, ...containerMetrics];
                            
                            return (
                              <ProFormSelect
                                name={`statistics_metric_${index}`}
                                label="Metric"
                                initialValue={selectedWidget?.widgetSettings?.metric || 'cpu_usage'}
                                options={metrics}
                                placeholder="Select metric"
                                rules={[{ required: true, message: 'Please select a metric' }]}
                              />
                            );
                          }}
                        </ProFormDependency>
                      </>
                    )}
                    
                    {setting.type === 'icon' && (
                      <ProFormSelect
                        name={`icon_${index}`}
                        label={setting.label}
                        options={[
                          { label: 'Dashboard', value: 'dashboard', icon: <DashboardOutlined /> },
                          { label: 'Bar Chart', value: 'chart', icon: <BarChartOutlined /> },
                          { label: 'User', value: 'user', icon: <UserOutlined /> },
                          { label: 'Settings', value: 'setting', icon: <SettingIcon /> },
                        ]}
                        placeholder="Select an icon"
                        fieldProps={{
                          optionRender: (option) => (
                            <Space>
                              {option.data.icon}
                              {option.data.label}
                            </Space>
                          ),
                        }}
                      />
                    )}
                    
                    {setting.type === 'backgroundColor' && (
                      <Form.Item
                        name={`backgroundColor_${index}`}
                        label={setting.label}
                        initialValue={setting.defaultValue || '#1890ff'}
                      >
                        <ColorPicker 
                          showText
                          presets={[
                            {
                              label: 'Theme Colors',
                              colors: [
                                '#1890ff',
                                '#52c41a',
                                '#faad14',
                                '#f5222d',
                                '#722ed1',
                                '#eb2f96',
                                '#13c2c2',
                                '#fa8c16',
                              ],
                            },
                          ]}
                        />
                      </Form.Item>
                    )}
                    
                    {setting.type === 'title' && (
                      <ProFormText
                        name={`title_${index}`}
                        label={setting.label}
                        placeholder="Enter widget title"
                        initialValue={selectedWidget?.title || setting.defaultValue || ''}
                        rules={[{ required: true, message: 'Please enter a title' }]}
                      />
                    )}
                    
                    {setting.type === 'customText' && (
                      <ProFormTextArea
                        name={`customText_${index}`}
                        label={setting.label}
                        placeholder="Enter custom text"
                        initialValue={setting.defaultValue || ''}
                        fieldProps={{
                          rows: 4,
                        }}
                      />
                    )}
                    
                    {setting.type === 'dateRange' && (
                      <>
                        <ProFormSelect
                          name={`dateRangePreset_${index}`}
                          label="Date Range"
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
                                  label="Custom Date Range"
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
                      </>
                    )}
                    
                    {setting.type === 'aggregationType' && (
                      <ProFormSelect
                        name={`aggregationType_${index}`}
                        label={setting.label}
                        initialValue={selectedWidget?.widgetSettings?.aggregationType || 'average'}
                        options={[
                          { label: 'Average', value: 'average' },
                          { label: 'Sum', value: 'sum' },
                          { label: 'Minimum', value: 'min' },
                          { label: 'Maximum', value: 'max' },
                        ]}
                        placeholder="Select aggregation type"
                      />
                    )}
                  </div>
                ))}
              </ProForm>
            );
          })()}
        </Drawer>
      </Layout>
    </DndProvider>
  );
};

export default DashboardLayoutEngine;
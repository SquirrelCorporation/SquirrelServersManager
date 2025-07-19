/**
 * Dashboard Layout Engine
 * Main component that orchestrates the dashboard functionality
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layout, Card, Button, Drawer, Space, Switch, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import DndProvider from '../DndProvider';
import dashboardService from '@/services/rest/dashboard.service';
import type { Dashboard, DashboardWidget } from '@/services/rest/dashboard.service';
import { DashboardItem } from './types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import DraggableItem from './DraggableItem';
import WidgetGallery from './WidgetGallery';
import SettingsDrawer from './SettingsDrawer';
import DashboardGrid from './DashboardGrid';
import '../DashboardLayoutEngine.css';

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
          
          // Find the original item to check if it has custom settings
          const originalItem = availableItems.find(avItem => 
            widgetType === avItem.id
          );
          
          let settings: WidgetConfiguration | undefined = undefined;
          
          if (item.widgetSettings) {
            // Check if widget has custom settings component
            if (originalItem?.settingsComponent || originalItem?.hasSettings) {
              // Store custom settings as-is
              settings = item.widgetSettings;
            } else {
              // Map our internal format to the backend format for standard widgets
              console.log('🔄 Converting widget settings for:', item.id);
              console.log('  - source:', item.widgetSettings.source);
              console.log('  - dataType:', item.widgetSettings.dataType);
              
              settings = {
                statistics_type: item.widgetSettings.dataType,
                statistics_source: item.widgetSettings.source,
                statistics_metric: item.widgetSettings.metric,
                title: item.title,
                dateRangePreset: item.widgetSettings.dateRangePreset,
                customDateRange: item.widgetSettings.customDateRange,
                colorPalette: item.widgetSettings.colorPalette,
                customColors: item.widgetSettings.customColors,
                // Include any other settings
                ...Object.keys(item.widgetSettings).reduce((acc, key) => {
                  if (!['dataType', 'source', 'metric', 'title', 'dateRangePreset', 'customDateRange', 'colorPalette', 'customColors'].includes(key)) {
                    acc[key] = item.widgetSettings[key];
                  }
                  return acc;
                }, {} as any),
              } as WidgetConfiguration;
            }
          } else if (item.settings) {
            // Map settings from form values
            settings = {
              title: item.title,
              // Add other settings as needed
            };
          }
          
          return {
            id: item.id,
            widgetType: widgetType,
            title: item.title,
            size: item.size,
            position: index,
            settings: settings,
          };
        });
        
        console.log('💾 Saving widgets to backend:', widgets);
        await dashboardService.updateWidgets(
          currentDashboard._id!,
          currentPageId,
          widgets
        );
        console.log('✅ Widgets saved successfully');
        
        // Silent save - no success message for auto-save
      } catch (error) {
        console.error('Auto-save failed:', error);
        message.error('Failed to save dashboard changes');
      } finally {
        setSaving(false);
      }
    }, 1000); // 1 second debounce
  }, [currentDashboard, currentPageId, availableItems]);

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

  const handleWidgetSettings = useCallback((widgetId: string) => {
    // Close and reopen to ensure clean state
    setSettingsDrawerVisible(false);
    setSelectedWidgetId(widgetId);
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setSettingsDrawerVisible(true);
    }, 0);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      // Auto-save after removing
      autoSave(newItems);
      return newItems;
    });
  }, [autoSave]);

  const handleSettingsSave = useCallback((widgetId: string, widgetSettings: WidgetConfiguration) => {
    setItems((prevItems) => {
      const newItems = prevItems.map(item => {
        if (item.id === widgetId) {
          // Find the original item in availableItems to get componentFactory
          // Extract widget type from timestamped ID (e.g., "medium-graph-1234567890" -> "medium-graph")
          const parts = item.id.split('-');
          const timestamp = parts[parts.length - 1];
          const widgetType = item.id.replace(`-${timestamp}`, '');
          
          const originalItem = availableItems.find(avItem => 
            avItem.id === widgetType
          );
          
          console.log('🔧 Settings save - Widget:', item.id, '→ Type:', widgetType, '→ Found:', !!originalItem);
          
          // If the item has a componentFactory, use it to create a new component
          if (originalItem?.componentFactory) {
            console.log('🔧 Creating new component with settings:', widgetSettings);
            return {
              ...item,
              widgetSettings,
              component: originalItem.componentFactory(widgetSettings),
              title: widgetSettings.title as string || item.title,
            };
          }
          
          return {
            ...item,
            widgetSettings,
            title: widgetSettings.title as string || item.title,
          };
        }
        return item;
      });
      
      // Auto-save after updating settings
      autoSave(newItems);
      
      return newItems;
    });
  }, [availableItems, autoSave]);

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
        console.log('📥 Loading widgets from backend:', defaultPage.widgets);
        console.log('📥 Raw widget settings:', defaultPage.widgets.map(w => ({ 
          id: w.id, 
          settings: w.settings 
        })));
        const loadedItems = defaultPage.widgets.map(widget => {
          const availableItem = availableItems.find(item => item.id === widget.widgetType);
          if (availableItem) {
            // Convert backend settings format to our internal format
            let widgetSettings: WidgetConfiguration | undefined = undefined;
            
            if (widget.settings) {
              // Check if widget has custom settings component
              if (availableItem.settingsComponent || availableItem.hasSettings) {
                // Load custom settings as-is
                widgetSettings = widget.settings;
              } else {
                // Convert standard widget settings
                widgetSettings = {
                  dataType: widget.settings.statistics_type || 'device',
                  source: widget.settings.statistics_source,
                  metric: widget.settings.statistics_metric || 'cpu_usage',
                  title: widget.settings.title,
                  dateRangePreset: widget.settings.dateRangePreset || 'last7days',
                  customDateRange: widget.settings.customDateRange,
                  colorPalette: widget.settings.colorPalette || 'default',
                  customColors: widget.settings.customColors,
                  // Include any other settings
                  ...Object.keys(widget.settings).reduce((acc, key) => {
                    if (!['statistics_type', 'statistics_source', 'statistics_metric', 'title', 'dateRangePreset', 'customDateRange', 'colorPalette', 'customColors'].includes(key)) {
                      acc[key] = widget.settings![key];
                    }
                    return acc;
                  }, {} as any),
                } as WidgetConfiguration;
              }
            }
            
            // If the widget has settings and a componentFactory, recreate the component
            const component = availableItem.componentFactory && widgetSettings
              ? availableItem.componentFactory(widgetSettings)
              : availableItem.component;
            
            return {
              ...availableItem,
              id: widget.id,
              title: widget.settings?.title as string || widget.title || availableItem.title,
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

  const selectedWidget = selectedWidgetId ? items.find(item => item.id === selectedWidgetId) : null;

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
              <DashboardGrid
                items={items}
                isEditMode={isEditMode}
                moveItem={moveItem}
                handleWidgetSettings={handleWidgetSettings}
                removeItem={removeItem}
              />
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
              <DashboardGrid
                items={items}
                isEditMode={isEditMode}
                moveItem={moveItem}
                handleWidgetSettings={handleWidgetSettings}
                removeItem={removeItem}
              />
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
          <WidgetGallery
            availableItems={availableItems}
            onAddWidget={addItem}
          />
        </Drawer>

        <SettingsDrawer
          visible={settingsDrawerVisible}
          selectedWidget={selectedWidget}
          onClose={() => {
            setSettingsDrawerVisible(false);
            setSelectedWidgetId(null);
          }}
          onSave={handleSettingsSave}
        />
      </Layout>
    </DndProvider>
  );
};

export default DashboardLayoutEngine;
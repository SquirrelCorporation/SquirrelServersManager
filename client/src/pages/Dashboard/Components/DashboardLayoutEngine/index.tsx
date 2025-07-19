/**
 * Dashboard Layout Engine
 * Main component that orchestrates the dashboard functionality
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Layout, Card, Button, Drawer, Space, Switch, message, Spin, Modal } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import DndProvider from '../DndProvider';
import dashboardService from '@/services/rest/dashboard.service';
import type { Dashboard, DashboardWidget } from '@/services/rest/dashboard.service';
import { DashboardItem } from './types';
import { WidgetConfiguration } from '../../Core/WidgetSettings.types';
import { dashboardLogger } from '@/utils/logger';
import DraggableItem from './DraggableItem';
import WidgetGallery from './WidgetGallery';
import SettingsDrawer from './SettingsDrawer';
import DashboardGrid from './DashboardGrid';
import '../DashboardLayoutEngine.css';

interface DashboardLayoutEngineProps {
  availableItems: DashboardItem[];
  pageId?: string;
  onDeletePage?: () => void;
}

const DashboardLayoutEngine: React.FC<DashboardLayoutEngineProps> = ({ 
  availableItems, 
  pageId: propPageId,
  onDeletePage 
}) => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>(propPageId || 'default-page');
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
          
          // Just use widgetSettings as-is - no conversion needed
          const settings = item.widgetSettings || (item.settings ? { title: item.title } : undefined);
          
          if (settings) {
            dashboardLogger.debug('Widget settings for save:', {
              widgetId: item.id,
              settings: JSON.stringify(settings)
            });
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
        
        dashboardLogger.info('Saving widgets to backend', {
          count: widgets.length,
          widgets: widgets.map(w => ({
            id: w.id,
            widgetType: w.widgetType,
            settings: w.settings
          }))
        });
        
        await dashboardService.updateWidgets(
          currentDashboard._id!,
          currentPageId,
          widgets
        );
        
        dashboardLogger.success('Widgets saved successfully');
        
        // Silent save - no success message for auto-save
      } catch (error) {
        dashboardLogger.error('Auto-save failed', error);
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
          
          dashboardLogger.debug('Settings save', {
            widgetId: item.id,
            widgetType: widgetType,
            found: !!originalItem,
            incomingSettings: widgetSettings
          });
          
          // If the item has a componentFactory, use it to create a new component
          if (originalItem?.componentFactory) {
            dashboardLogger.debug('Creating new component with settings', widgetSettings);
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
      
      // Use propPageId if provided, otherwise find the default page or first page
      const targetPageId = propPageId || currentPageId;
      const targetPage = dashboard.pages.find(p => p.id === targetPageId) || 
                        dashboard.pages.find(p => p.isDefault) || 
                        dashboard.pages[0];
      
      if (targetPage) {
        setCurrentPageId(targetPage.id);
        
        // Convert saved widgets to DashboardItems
        dashboardLogger.info('Loading widgets from backend', {
          pageId: targetPage.id,
          count: targetPage.widgets.length,
          widgets: targetPage.widgets.map(w => ({ 
            id: w.id, 
            widgetType: w.widgetType,
            settings: w.settings 
          }))
        });
        const loadedItems = targetPage.widgets.map(widget => {
          const availableItem = availableItems.find(item => item.id === widget.widgetType);
          if (availableItem) {
            // Just use settings as-is from backend
            const widgetSettings = widget.settings;
            
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
      dashboardLogger.error('Failed to load dashboard', error);
      message.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [availableItems, propPageId, currentPageId]);

  const handleDeletePage = useCallback(async () => {
    if (!currentDashboard || !currentPageId) return;
    
    Modal.confirm({
      title: 'Delete Dashboard Page',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this dashboard page? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Filter out the current page
          const updatedPages = currentDashboard.pages.filter(p => p.id !== currentPageId);
          
          // Ensure we have at least one page
          if (updatedPages.length === 0) {
            message.error('Cannot delete the last dashboard page');
            return;
          }
          
          // Update the dashboard
          await dashboardService.update(currentDashboard._id!, {
            pages: updatedPages,
          });
          
          message.success('Dashboard page deleted successfully');
          
          // Trigger parent refresh
          if (onDeletePage) {
            onDeletePage();
          }
        } catch (error) {
          dashboardLogger.error('Failed to delete page', error);
          message.error('Failed to delete dashboard page');
        }
      },
    });
  }, [currentDashboard, currentPageId, onDeletePage]);

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
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleDeletePage}
                  disabled={!propPageId} // Disable delete for default dashboard
                >
                  Delete Page
                </Button>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    checkedChildren={<EditOutlined />}
                    unCheckedChildren={<EyeOutlined />}
                    checked={isEditMode}
                    onChange={setIsEditMode}
                  />
                  <span style={{ marginLeft: 8 }}>View Mode</span>
                </div>
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
/**
 * Dashboard Grid Component
 * Handles the layout and rendering of dashboard items
 */

import React from 'react';
import { Row, Col, Card, Space } from 'antd';
import DraggableItem from './DraggableItem';
import { DashboardItem, sizeToColSpan } from './types';
import { useDebugData } from './DebugDataProvider';
import { WidgetProvider } from './WidgetContext';

interface DashboardGridProps {
  items: DashboardItem[];
  isEditMode: boolean;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  handleWidgetSettings: (widgetId: string) => void;
  removeItem: (itemId: string) => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  items,
  isEditMode,
  moveItem,
  handleWidgetSettings,
  removeItem,
}) => {
  const { getDebugData } = useDebugData();
  
  // Helper to extract debug data from widget props
  const getWidgetDebugData = (item: DashboardItem): Record<string, unknown> => {
    // Extract widget type from ID
    const parts = item.id.split('-');
    const timestamp = parts[parts.length - 1];
    const widgetType = item.id.replace(`-${timestamp}`, '');
    
    return {
      componentName: widgetType,
      widgetId: item.id,
      widgetType: widgetType,
      title: item.title,
      size: item.size,
      settings: item.widgetSettings || {},
      hasSettings: item.hasSettings,
      category: item.category
    };
  };
  if (items.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 0', 
        color: 'rgba(0, 0, 0, 0.45)',
        background: isEditMode ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
        borderRadius: '4px'
      }}>
        <p>
          {isEditMode 
            ? 'No widgets added yet. Click "Add Widget" to customize your dashboard.'
            : 'No widgets added yet. Switch to Edit Mode to customize your dashboard.'}
        </p>
      </div>
    );
  }

  // Use the same layout for both edit and view modes
  return (
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
            widgetTitle={item.title}
            debugData={getDebugData(item.id) || getWidgetDebugData(item)}
          >
            <WidgetProvider widgetId={item.id}>
              {isEditMode ? (
                <Card 
                  title={item.title}
                  style={{
                    minHeight: 200,
                    height: '100%'
                  }}
                >
                  {item.component}
                </Card>
              ) : (
                item.component
              )}
            </WidgetProvider>
          </DraggableItem>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardGrid;
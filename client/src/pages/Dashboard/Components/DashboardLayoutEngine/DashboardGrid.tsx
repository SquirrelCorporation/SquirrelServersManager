/**
 * Dashboard Grid Component
 * Handles the layout and rendering of dashboard items
 */

import React from 'react';
import { Row, Col, Card, Space } from 'antd';
import DraggableItem from './DraggableItem';
import { DashboardItem, sizeToColSpan } from './types';

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

  if (isEditMode) {
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
            >
              <Card 
                title={item.title}
                style={{
                  minHeight: 200,
                  height: '100%'
                }}
              >
                {item.component}
              </Card>
            </DraggableItem>
          </Col>
        ))}
      </Row>
    );
  }

  // View mode layout
  const welcomeHeader = items.find(item => item.id.includes('welcome-header'));
  const tipsOfDay = items.find(item => item.id.includes('tips-of-the-day'));
  const otherWidgets = items.filter(item => 
    !item.id.includes('welcome-header') && !item.id.includes('tips-of-the-day')
  );
  
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* First row: Welcome Header and Tips */}
      {(welcomeHeader || tipsOfDay) && (
        <Row gutter={[24, 24]}>
          {welcomeHeader && (
            <Col xs={24} lg={16}>
              <DraggableItem
                id={welcomeHeader.id}
                index={0}
                moveItem={moveItem}
                isEditMode={false}
                onSettings={() => handleWidgetSettings(welcomeHeader.id)}
                onRemove={() => removeItem(welcomeHeader.id)}
              >
                {welcomeHeader.component}
              </DraggableItem>
            </Col>
          )}
          {tipsOfDay && (
            <Col xs={24} lg={8}>
              <DraggableItem
                id={tipsOfDay.id}
                index={1}
                moveItem={moveItem}
                isEditMode={false}
                onSettings={() => handleWidgetSettings(tipsOfDay.id)}
                onRemove={() => removeItem(tipsOfDay.id)}
              >
                {tipsOfDay.component}
              </DraggableItem>
            </Col>
          )}
        </Row>
      )}
      
      {/* Other widgets in their normal layout */}
      <Row gutter={[24, 24]}>
        {otherWidgets.map((item, index) => (
          <Col 
            key={item.id} 
            xs={24} 
            lg={sizeToColSpan[item.size]}
          >
            <DraggableItem
              id={item.id}
              index={index}
              moveItem={moveItem}
              isEditMode={false}
              onSettings={() => handleWidgetSettings(item.id)}
              onRemove={() => removeItem(item.id)}
            >
              {item.component}
            </DraggableItem>
          </Col>
        ))}
      </Row>
    </Space>
  );
};

export default DashboardGrid;
import React, { useState, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Layout, Card, Button, Drawer, Space, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, DragOutlined } from '@ant-design/icons';
import DndProvider from './DndProvider';

// Types
export type DashboardItemSize = 'small' | 'medium' | 'large' | 'wide' | 'full';

export interface DashboardItem {
  id: string;
  component: React.ReactNode;
  size: DashboardItemSize;
  title: string;
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
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, index, children, moveItem }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'DASHBOARD_ITEM',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'DASHBOARD_ITEM',
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
        cursor: 'move',
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 10 }}>
        <Tooltip title="Drag to rearrange">
          <DragOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
        </Tooltip>
      </div>
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

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const dragItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, dragItem);
      return newItems;
    });
  }, []);

  const addItem = useCallback((item: DashboardItem) => {
    setItems((prevItems) => [...prevItems, item]);
    setDrawerVisible(false);
  }, []);

  return (
    <DndProvider>
      <Layout>
        <Layout.Content style={{ padding: '24px', minHeight: '600px' }}>
          <Card 
            title="Customizable Dashboard" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setDrawerVisible(true)}
              >
                Add Widget
              </Button>
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
                  >
                    <Card 
                      title={item.title}
                      style={{
                        minHeight: sizeToMinHeight[item.size],
                        height: '100%'
                      }}
                    >
                      {item.component}
                    </Card>
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
        </Layout.Content>

        <Drawer
          title="Available Widgets"
          placement="right"
          width={350}
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
                style={{ marginBottom: 16 }}
                extra={
                  <Tooltip title={`Size: ${item.size}`}>
                    <span>{item.size.charAt(0).toUpperCase()}</span>
                  </Tooltip>
                }
              >
                <div style={{ height: '80px', overflow: 'hidden' }}>
                  Preview of {item.title}
                </div>
              </Card>
            ))}
          </Space>
        </Drawer>
      </Layout>
    </DndProvider>
  );
};

export default DashboardLayoutEngine;
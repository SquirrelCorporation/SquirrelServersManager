/**
 * Draggable Item Component
 * Handles drag and drop functionality for dashboard widgets
 */

import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button, Tooltip, Modal, Dropdown } from 'antd';
import { DragOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface DraggableItemProps {
  id: string;
  index: number;
  children: React.ReactNode;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  isEditMode: boolean;
  onSettings?: () => void;
  onRemove?: () => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ 
  id, 
  index, 
  children, 
  moveItem, 
  isEditMode, 
  onSettings, 
  onRemove 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
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

  // Context menu items
  const contextMenuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Widget Settings',
      onClick: () => {
        onSettings?.();
      }
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Widget',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Remove widget',
          content: 'Are you sure you want to remove this widget?',
          onOk: () => onRemove?.(),
          okText: 'Yes',
          cancelText: 'No',
          icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
        });
      }
    }
  ];

  return (
    <Dropdown
      menu={{ 
        items: contextMenuItems,
        className: 'dashboard-widget-context-menu'
      }}
      trigger={['contextMenu']}
      destroyPopupOnHide
      placement="bottomRight"
    >
      <div 
        ref={ref} 
        style={{ 
          opacity: isDragging ? 0.5 : 1,
          cursor: isEditMode ? 'move' : 'default',
          position: 'relative',
          transition: 'box-shadow 0.2s',
          boxShadow: isHovered && !isEditMode ? '0 0 0 1px rgba(24, 144, 255, 0.2)' : undefined,
          borderRadius: '8px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            <Tooltip title="Remove widget">
              <Button 
                size="small" 
                icon={<DeleteOutlined />} 
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Remove widget',
                    content: 'Are you sure you want to remove this widget?',
                    onOk: () => onRemove?.(),
                    okText: 'Yes',
                    cancelText: 'No',
                  });
                }}
                style={{ opacity: 0.7 }}
              />
            </Tooltip>
            <Tooltip title="Drag to rearrange">
              <DragOutlined style={{ color: 'rgba(0,0,0,0.45)', fontSize: 20 }} />
            </Tooltip>
          </div>
        )}
        {!isEditMode && isHovered && (
          <Tooltip 
            title="Right-click for options" 
            placement="top"
          >
            <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0.5 }}>
              <SettingOutlined style={{ fontSize: 12 }} />
            </div>
          </Tooltip>
        )}
        {children}
      </div>
    </Dropdown>
  );
};

export default DraggableItem;
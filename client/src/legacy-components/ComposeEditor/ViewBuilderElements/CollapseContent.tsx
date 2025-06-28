import DroppableArea from '@/components/ComposeEditor/DroppableArea';
import { MenuElements } from '@/components/ComposeEditor/Menu/MenuElements';
import { generateId } from '@/components/ComposeEditor/utils/id';
import { DragDrop2 } from '@/components/Icons/CustomIcons';
import { ProFormInstance } from '@ant-design/pro-components';
import { Space, Typography } from 'antd';
import React from 'react';
import { MenuElementType } from '../types';
import { buildSubRow } from './SubRowBuilder';

const CollapseContent: React.FC<{
  element: MenuElementType;
  setCurrentElement: (element?: MenuElementType) => void;
  currentStack: MenuElementType[] | undefined;
  setCurrentStack: React.Dispatch<React.SetStateAction<MenuElementType[]>>;
  index: number;
  path: string;
  form: ProFormInstance;
}> = ({
  element,
  setCurrentElement,
  currentStack,
  setCurrentStack,
  index,
  path,
  form,
}) => {
  const allowedChildren = MenuElements.find(
    (f) => f.id === element.id,
  )?.children;

  return (
    <DroppableArea
      id={generateId(element, element.index as number)}
      index={element.index as number}
      group={element.id}
      allowedDraggables={
        allowedChildren?.map((f: MenuElementType) => f.id) as string[]
      }
    >
      <div
        style={{
          width: '100%',
          minHeight: '10vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div id={element.id} style={{ width: '100%', height: '100%' }}>
          {buildSubRow(
            element.children as MenuElementType[],
            element.id,
            index,
            currentStack as MenuElementType[],
            setCurrentStack,
            path,
            form,
          )}
        </div>
      </div>
      <div
        id={element.id}
        style={{
          minHeight: '3vh',
          width: '100%',
          marginTop: 10,
          border: '1px dashed #424242',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={(event) => {
          const hoverElement = MenuElements.find(
            (f) => f.id === event.currentTarget.id,
          );
          if (hoverElement?.children && hoverElement.children.length > 0) {
            setCurrentElement(hoverElement);
          }
        }}
      >
        <Space
          direction={'vertical'}
          size={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <DragDrop2 style={{ fontSize: '20px' }} />
          <Typography.Text>Drop {element.name} Elements Here</Typography.Text>
        </Space>
      </div>
    </DroppableArea>
  );
};

export default CollapseContent;

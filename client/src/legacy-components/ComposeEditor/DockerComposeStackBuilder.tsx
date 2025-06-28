// components/StackBuilder.tsx
import { MenuElements } from '@/components/ComposeEditor/Menu/MenuElements';
import { StackAdditionHandler } from '@/components/ComposeEditor/StackHandler';
import { ProFormInstance } from '@ant-design/pro-components';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Col, Row } from 'antd';
import React, { useState } from 'react';
import StackMenu from './StackMenu';
import StackPanel from './StackPanel';
import { MenuElementType } from './types';

export interface StackBuilderHandles {
  setStack: (stack: any) => void;
  getStack: () => any;
}

export interface StackBuilderProps {
  elementTypes: MenuElementType[];
  formRef: ProFormInstance;
  currentStack: MenuElementType[] | undefined;
  setCurrentStack: (stack: MenuElementType[] | undefined) => void;
  stackIcon: {
    icon: string;
    iconColor: string;
    iconBackgroundColor: string;
  };
  setStackIcon: any;
  onClickSaveStack: () => void;
}

const DockerComposeStackBuilder: React.FC<StackBuilderProps> = ({
  elementTypes,
  formRef,
  currentStack,
  setCurrentStack,
  stackIcon,
  setStackIcon,
  onClickSaveStack,
}) => {
  const [currentElement, setCurrentElement] = useState<
    MenuElementType | undefined
  >();

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const overData = over?.data.current; // Ensure you are accessing 'current'
    if (over && active) {
      if (over.id === 'main') {
        const updatedStack = StackAdditionHandler(
          over.id,
          active.id as string,
          currentStack,
          overData?.index,
          overData?.group,
        ) as MenuElementType[];
        setCurrentStack(updatedStack ? updatedStack : currentStack);
        setCurrentElement(MenuElements.find((e) => e.id === active.id));
      } else {
        const updatedStack = StackAdditionHandler(
          over.id as string,
          active.id as string,
          currentStack,
          overData?.index,
          overData?.group,
        ) as MenuElementType[];
        setCurrentStack(updatedStack ? updatedStack : currentStack);
        setCurrentElement(MenuElements.find((e) => e.id === overData?.group));
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Row gutter={16}>
        <Col span={16}>
          <StackPanel
            currentStack={currentStack}
            elementTypes={elementTypes}
            setCurrentElement={setCurrentElement}
            setCurrentStack={setCurrentStack}
            formRef={formRef}
            setStackIcon={setStackIcon}
            stackIcon={stackIcon}
            onClickSaveStack={onClickSaveStack}
          />
        </Col>
        <Col span={8}>
          <StackMenu
            currentStack={currentStack}
            elementTypes={elementTypes}
            currentElement={currentElement}
            setCurrentElement={setCurrentElement}
          />
        </Col>
      </Row>
    </DndContext>
  );
};

export default DockerComposeStackBuilder;

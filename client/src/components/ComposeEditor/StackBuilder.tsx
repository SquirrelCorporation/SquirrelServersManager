// components/StackBuilder.tsx
import { ProForm } from '@ant-design/pro-components';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Col, message, Row } from 'antd';
import React, { useState } from 'react';
import StackMenu from './StackMenu';
import StackPanel from './StackPanel';
import { ExtendedMenuElementType, MenuElementType } from './types';

const StackBuilder: React.FC<{ elementTypes: MenuElementType[] }> = ({
  elementTypes,
}) => {
  const [currentElement, setCurrentElement] = useState<
    MenuElementType | undefined
  >();
  const [currentStack, setCurrentStack] = useState<
    MenuElementType[] | undefined
  >();
  const [currentMenu, setCurrentMenu] =
    useState<ExtendedMenuElementType[]>(elementTypes);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over && active) {
      if (over.id === 'main') {
        const droppedElement = elementTypes.find((e) => e.id === active.id);
        if (
          droppedElement &&
          !currentStack?.find((e) => e.id === droppedElement.id)
        ) {
          setCurrentStack(
            currentStack
              ? [...currentStack, { ...droppedElement, children: [] }]
              : [{ ...droppedElement, children: [] }],
          );
          setCurrentElement(droppedElement);
          setCurrentMenu(
            currentMenu.map((e) =>
              e.id === droppedElement.id ? { ...e, inUse: true } : e,
            ) || [],
          );
        }
      } else {
        const subElement = elementTypes.find((e) => e.id === over.id);
        const droppedElement = subElement?.children?.find(
          (e) => e.id === active.id,
        );
        const subCurrentStack = currentStack?.find((e) => e.id === over.id);
        if (droppedElement) {
          if (
            subElement &&
            subElement.children &&
            subCurrentStack &&
            subCurrentStack.children &&
            !subCurrentStack.children.find((e) => e.id === droppedElement.id)
          ) {
            const updatedStack = currentStack?.map((stackItem) =>
              stackItem.id === over.id
                ? {
                    ...stackItem,
                    children: [
                      ...(stackItem.children || []),
                      { ...droppedElement, children: [] },
                    ],
                  }
                : stackItem,
            );
            setCurrentStack(updatedStack);

            setCurrentMenu(
              currentMenu.map((e) =>
                e.id === over.id
                  ? {
                      ...e,
                      children: e.children?.map(
                        (f: ExtendedMenuElementType) => {
                          return {
                            ...f,
                            inUse: f.id === droppedElement.id ? true : f.inUse,
                          };
                        },
                      ),
                    }
                  : e,
              ),
            );
          } else {
            message.warning('Element already exists');
          }
        }
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Row gutter={16}>
        <Col span={16}>
          <ProForm>
            <StackPanel
              currentStack={currentStack}
              elementTypes={elementTypes}
              setCurrentElement={setCurrentElement}
            />
          </ProForm>
        </Col>
        <Col span={8}>
          <StackMenu
            currentStack={currentStack}
            elementTypes={elementTypes}
            currentElement={currentElement}
            setCurrentElement={setCurrentElement}
            currentMenu={currentMenu}
          />
        </Col>
      </Row>
    </DndContext>
  );
};

export default StackBuilder;

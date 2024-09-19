// components/StackPanel.tsx
import { Card, Collapse, Typography } from 'antd';
import React from 'react';
import DroppableArea from './DroppableArea';
import { buildView } from './FormUtils';
import { MenuElementType } from './types';

type StackPanelProps = {
  currentStack?: MenuElementType[];
  elementTypes: MenuElementType[];
  setCurrentElement: (element?: MenuElementType) => void;
};

const StackPanel: React.FC<StackPanelProps> = ({
  currentStack,
  elementTypes,
  setCurrentElement,
}) => {
  return (
    <Card>
      {currentStack && (
        <Collapse
          style={{ marginBottom: 40 }}
          activeKey={currentStack.map((e) => e.id)}
          items={currentStack.map((e) =>
            buildView(e, setCurrentElement, elementTypes),
          )}
        />
      )}
      <DroppableArea
        id={'main'}
        allowedDraggables={elementTypes.map((e) => e.id)}
      >
        <div
          style={{
            height: '10vh',
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
          onClick={() => setCurrentElement(undefined)}
        >
          <Typography.Text>Drop Main Elements Here</Typography.Text>
        </div>
      </DroppableArea>
    </Card>
  );
};

export default StackPanel;

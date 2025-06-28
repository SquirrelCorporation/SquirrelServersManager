import { RedoOutlined, SaveOutlined } from '@ant-design/icons';
import { FloatButton, Popconfirm } from 'antd';
import { DeleteOutline } from 'antd-mobile-icons';
import React from 'react';
import { API } from 'ssm-shared-lib';

type FloatingButtonsBarProps = {
  onClickSaveStack: () => void;
  onClickDeleteStack: () => void;
  onClickUndoStack: () => void;
  currentSavedStack?: API.ContainerCustomStack;
};

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({
  onClickSaveStack,
  onClickDeleteStack,
  onClickUndoStack,
  currentSavedStack,
}) => {
  return (
    <FloatButton.Group shape="square" style={{ right: 94 }}>
      <FloatButton
        onClick={onClickSaveStack}
        tooltip={'Save stack'}
        icon={<SaveOutlined style={{ color: 'blueviolet' }} />}
      />
      <FloatButton.BackTop tooltip={'Scroll to top'} visibilityHeight={0} />
      {currentSavedStack && (
        <>
          <FloatButton
            tooltip={'Reset changes'}
            icon={<RedoOutlined />}
            onClick={onClickUndoStack}
          />
          <Popconfirm
            title="Delete the stack"
            description="Are you sure to delete this stack?"
            onConfirm={onClickDeleteStack}
            okText="Yes"
            cancelText="No"
          >
            <FloatButton
              tooltip={'Delete stack'}
              icon={<DeleteOutline style={{ color: 'red' }} />}
            />
          </Popconfirm>
        </>
      )}
    </FloatButton.Group>
  );
};

export default FloatingButtonsBar;

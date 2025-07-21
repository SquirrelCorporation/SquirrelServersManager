import { RedoOutlined, SaveOutlined } from '@ant-design/icons';
import { FloatButton, Popconfirm } from 'antd';
import { DeleteOutline } from 'antd-mobile-icons';
import React from 'react';
import { API } from 'ssm-shared-lib';

type FloatingButtonsBarProps = {
  onClickSavePlaybook: () => void;
  onClickDeletePlaybook: () => void;
  onClickUndoPlaybook: () => void;
  selectedFile?: API.PlaybookFile;
};

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({
  onClickSavePlaybook,
  onClickDeletePlaybook,
  onClickUndoPlaybook,
  selectedFile,
}) => (
  <FloatButton.Group shape="square" style={{ right: 94 }}>
    <FloatButton
      onClick={onClickSavePlaybook}
      tooltip={'Save file'}
      icon={<SaveOutlined style={{ color: 'blueviolet' }} />}
    />
    <FloatButton.BackTop tooltip={'Scroll to top'} visibilityHeight={0} />
    <FloatButton
      tooltip={'Reset changes'}
      icon={<RedoOutlined />}
      onClick={onClickUndoPlaybook}
    />
    {selectedFile?.custom && (
      <Popconfirm
        title="Delete the playbook"
        description="Are you sure to delete this playbook?"
        onConfirm={onClickDeletePlaybook}
        okText="Yes"
        cancelText="No"
      >
        <FloatButton
          tooltip={'Delete file'}
          icon={<DeleteOutline style={{ color: 'red' }} />}
        />
      </Popconfirm>
    )}
  </FloatButton.Group>
);

export default FloatingButtonsBar;

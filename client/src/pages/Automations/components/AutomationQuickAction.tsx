import {
  deleteAutomation,
  executeAutomation,
} from '@/services/rest/automations';
import {
  DeleteOutlined,
  DownOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { Dropdown, MenuProps, message, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type AutomationQuickActionProps = {
  record: API.Automation;
  reload: () => void;
};

const items = [
  {
    label: (
      <>
        <PlayCircleOutlined /> Execute
      </>
    ),
    key: '1',
  },
  {
    label: (
      <>
        <DeleteOutlined /> Delete
      </>
    ),
    key: '2',
  },
];

const AutomationQuickAction: React.FC<AutomationQuickActionProps> = (props) => {
  const onClick: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case '1':
        await executeAutomation(props.record.uuid).then(() => {
          message.loading({
            content: 'Execution in progress',
            duration: 6,
          });
        });
        break;
      case '2':
        await deleteAutomation(props.record.uuid).then(() => {
          props.reload();
          message.warning({
            content: 'Automation deleted',
            duration: 6,
          });
        });
        break;
    }
  };
  return (
    <Dropdown menu={{ items, onClick }}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>{<DownOutlined />}</Space>
      </a>
    </Dropdown>
  );
};

export default AutomationQuickAction;

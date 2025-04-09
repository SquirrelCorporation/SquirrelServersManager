import {
  deleteAutomation,
  executeAutomation,
} from '@/services/rest/automations/automations';
import {
  DeleteOutlined,
  DownOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import message from '@/components/Message/DynamicMessage';
import { Dropdown, MenuProps, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type AutomationQuickActionProps = {
  record: API.Automation;
  reload: () => void;
};

const items = [
  {
    label: 'Execute',
    icon: <PlayCircleOutlined />,
    key: '1',
  },
  {
    label: 'Show execution logs',
    icon: <UnorderedListOutlined />,
    key: 2,
  },
  {
    label: 'Delete',
    icon: <DeleteOutlined />,
    key: '3',
  },
];

const AutomationQuickAction: React.FC<AutomationQuickActionProps> = ({
  record,
  reload,
}) => {
  const onClick: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case '1':
        await executeAutomation(record.uuid).then(() => {
          message.loading({
            content: 'Execution in progress',
            duration: 6,
          });
        });
        break;
      case '3':
        await deleteAutomation(record.uuid).then(() => {
          reload();
          message.warning({
            content: 'Automation deleted',
            duration: 6,
          });
        });
        break;
      case '2':
        history.push({
          pathname: '/admin/logs',
          // @ts-expect-error lib missing type
          search: `?module=automation&moduleId=${record.uuid}`,
        });
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

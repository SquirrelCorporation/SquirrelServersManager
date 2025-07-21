import { StackIcon } from '@/components/ComposeEditor/StackIconSelector';
import DeployCustomStackModal from '@/pages/Containers/components/sub-components/DeployCustomStackModal';
import {
  deleteContainerCustomStack,
  getCustomStacks,
} from '@/services/rest/container-stacks/container-stacks';
import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import message from '@/components/Message/DynamicMessage';
import { Button, Tag } from 'antd';
import React, { useRef } from 'react';
import { API } from 'ssm-shared-lib';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

const Stacks: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const handleSubMenu = async (key: string, uuid: string) => {
    switch (key) {
      case 'delete':
        await deleteContainerCustomStack(uuid).then(() => {
          message.success({
            content: 'Successfully deleted stack',
            duration: 6,
          });
          actionRef?.current?.reload();
        });
        return;
      case 'edit':
        history.push(`/stack/compose?stackUuid=${uuid}`);
    }
  };

  const columns: ProColumns<API.ContainerCustomStack>[] = [
    {
      align: 'center',
      render: (_, record) => (
        <StackIcon
          stackIcon={{
            icon: record.icon,
            iconColor: record.iconColor,
            iconBackgroundColor: record.iconBackgroundColor,
          }}
          size={'large'}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      ellipsis: false,
    },
    {
      title: 'Type',
      dataIndex: 'lockJson',
      render: (value) => (
        <>
          {value ? (
            <Tag color={'geekblue'}>CODE EDITOR</Tag>
          ) : (
            <Tag color={'orange'}>UI EDITOR</Tag>
          )}
        </>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createAt',
      ellipsis: false,
    },
    {
      title: 'Action',
      key: 'option',
      valueType: 'option',
      render: (dom, record) => [
        <DeployCustomStackModal
          key="deploy"
          name={record.name}
          stackUuid={record.uuid}
          stackIcon={{
            icon: record.icon,
            iconColor: record.iconColor,
            iconBackgroundColor: record.iconBackgroundColor,
          }}
        />,
        <TableDropdown
          onSelect={(key) => handleSubMenu(key, record.uuid)}
          key="actionGroup"
          menus={[
            { key: 'edit', name: 'Edit' },
            { key: 'delete', name: 'Delete' },
          ]}
        />,
      ],
    },
  ];

  return (
    <ProTable<API.ContainerCustomStack>
      columns={columns}
      request={getCustomStacks}
      rowKey="uuid"
      search={{
        filterType: 'light',
      }}
      actionRef={actionRef}
      options={false}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
      }}
      toolBarRender={() => [
        <Button
          key={'add-stack'}
          type={'primary'}
          icon={<PlusOutlined />}
          onClick={() =>
            history.push({
              pathname: `/stack/compose`,
            })
          }
        >
          Add a custom stack
        </Button>,
        <InfoLinkWidget
          tooltipTitle="Help for containers."
          documentationLink="https://squirrelserversmanager.io/docs/user-guides/containers/management"
        />,
      ]}
    />
  );
};

export default Stacks;

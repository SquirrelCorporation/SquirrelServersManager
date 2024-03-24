import ServerLogsColumns from '@/pages/Admin/Logs/ServerLogsColums';
import { getServerLogs, getTasksLogs } from '@/services/rest/logs';
import { SettingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import React from 'react';
import { Avatar, Col, Row, Tabs, Typography } from 'antd';
import TaskLogsColumns from '@/pages/Admin/Logs/TaskLogsColumns';
import { API } from 'ssm-shared-lib';

const logsTabItem = [
  {
    key: '1',
    label: <div>Server Logs</div>,
    children: (
      <ProTable<API.ServerLog>
        rowKey="_id"
        request={getServerLogs}
        columns={ServerLogsColumns}
        search={{
          labelWidth: 120,
        }}
        dateFormatter="string"
      />
    ),
  },
  {
    key: '2',
    label: <div>Task Logs</div>,
    children: (
      <ProTable<API.Task>
        rowKey="ident"
        request={getTasksLogs}
        columns={TaskLogsColumns}
        search={{
          labelWidth: 120,
        }}
        dateFormatter="string"
      />
    ),
  },
];

const Index: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: (
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#21561b' }}
                shape="square"
                icon={<UnorderedListOutlined />}
              />
            </Col>
            <Col
              style={{ marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' }}
            >
              <Typography.Title
                style={{
                  marginLeft: 5,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
                level={4}
              >
                {' '}
                Logs
              </Typography.Title>
            </Col>
          </Row>
        ),
      }}
    >
      <Tabs items={logsTabItem} />
    </PageContainer>
  );
};

export default Index;

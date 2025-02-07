import DeviceQuickActionDropDown from '@/components/DeviceComponents/DeviceQuickAction/DeviceQuickActionDropDown';
import { Proxmox, Remote, UserSecret } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import { getSecurityTestResults } from '@/services/rest/security';
import {
  DockerOutlined,
  LikeOutlined,
  PlaySquareOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Card, Col, Row, Statistic, Tag, Tooltip } from 'antd';
import React from 'react';

const columns: ProColumns<API.DeviceItem>[] = [
  {
    title: 'Priority',
    dataIndex: 'priority',
    valueType: 'textarea',
    render: (_, row) => <>{row.priority?.toUpperCase()}</>,
  },
  {
    title: 'Device',
    dataIndex: 'uuid',
    valueType: 'textarea',
    render: (_, row) => <>{row.device.ip}</>,
  },
  {
    title: 'TestID',
    dataIndex: 'id',
    valueType: 'textarea',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    valueType: 'textarea',
  },
  {
    title: 'Category',
    dataIndex: 'category',
    valueType: 'textarea',
    sorter: true,
  },
  {
    title: 'Result',
    dataIndex: 'result',
    valueType: 'textarea',
    render: (_, row) => {
      return (
        <Tag color={row.result.status === 'pass' ? 'green' : 'red'}>
          {row.result.status?.toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: 'Message',
    dataIndex: ['result', 'message'],
    valueType: 'textarea',
  },
  {
    title: 'Updated at',
    sorter: true,
    dataIndex: 'updatedAt',
    valueType: 'dateTime',
    hideInSearch: true,
  },
];
const Security = () => {
  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Security'}
            backgroundColor={TitleColors.SECURITY}
            icon={<SecurityScanOutlined />}
          />
        ),
      }}
    >
      <Row gutter={16}>
        <Col span={18}>
          <Avatar size={64} icon={<PlaySquareOutlined />} />
        </Col>
        <Col span={3}>
          <Statistic title="Feedback" value={1128} prefix={<LikeOutlined />} />
        </Col>
        <Col span={3}>
          <Statistic title="Unmerged" value={93} suffix="/ 100" />
        </Col>
      </Row>{' '}
      <ProTable
        search={false}
        columns={columns}
        style={{ marginTop: 16 }}
        request={getSecurityTestResults}
      />
    </PageContainer>
  );
};

export default Security;

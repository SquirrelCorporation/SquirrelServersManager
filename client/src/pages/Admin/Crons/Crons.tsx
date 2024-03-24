import CronColumns from '@/pages/Admin/Crons/CronsColumns';
import { getCrons } from '@/services/rest/cron';
import { InteractionOutlined, UnorderedListOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import { Avatar, Col, Row, Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const Crons: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: (
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#142312' }}
                shape="square"
                icon={<InteractionOutlined />}
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
                Crons
              </Typography.Title>
            </Col>
          </Row>
        ),
      }}
    >
      <ProTable<API.Cron>
        rowKey="name"
        request={getCrons}
        columns={CronColumns}
        search={false}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
export default Crons;

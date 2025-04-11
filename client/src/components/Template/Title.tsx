import { Avatar, Col, Row, Typography } from 'antd';
import React, { ReactNode } from 'react';

export enum TitleColors {
  CRONS = '#142312',
  INVENTORY = '#9f0f2e',
  LOGS = '#21561b',
  SETTINGS = '#266ea8',
  DEVICES = '#5e9a35',
  PLAYBOOKS = '#554dce',
  CONTAINER_LOGS = '#4942ae',
  LOGS_RETENTION = '#7c4275',
  SETTINGS_DEVICES = '#ab6e43',
  DASHBOARD = '#b0412a',
  DANGER_ZONE = '#f51b36',
  USER_LOGS = '#6d26a8',
  API = '#1e6d80',
  SERVER = '#8e7d50',
  GIT = '#336048',
  LOCAL = '#4b4a4a',
  DEBUG = '#b614b6',
  ANSIBLE_CONF = '#c1660e',
  COMPOSE = '#8e7418',
  HOST_URL = '#368e18',
  SECRET = '#16739a',
}

export type PageContainerTitleProps = {
  title: string;
  backgroundColor: TitleColors;
  icon: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  isMain?: boolean;
};

const avatarStyle = (backgroundColor: string) => ({ backgroundColor });
const colStyle = { marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' };

const PageContainerTitleRow: React.FC<PageContainerTitleProps> = ({
  title,
  backgroundColor,
  icon,
  level,
  isMain,
}) => (
  <Row>
    <Col>
      <Avatar style={avatarStyle(backgroundColor)} shape="circle" icon={icon} />
    </Col>
    <Col style={colStyle}>
      {isMain ? (
        <Typography.Title level={level || 4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
      ) : (
        title
      )}
    </Col>
  </Row>
);

const MainTitle: React.FC<PageContainerTitleProps> = (props) => (
  <PageContainerTitleRow {...props} isMain />
);

const SubTitle: React.FC<PageContainerTitleProps> = (props) => (
  <PageContainerTitleRow {...props} />
);

export default {
  MainTitle,
  SubTitle,
};

import { Avatar, Col, Row, Typography } from 'antd';
import React, { ReactNode } from 'react';

export enum PageContainerTitleColors {
  CRONS = '#142312',
  INVENTORY = '#9f0f2e',
  LOGS = '#21561b',
  SETTINGS = '#266ea8',
  DEVICES = '#5e9a35',
  PLAYBOOKS = '#554dce',
}

export enum SettingsSubTitleColors {
  LOGS_RETENTION = '#7c4275',
  DEVICES = '#ab6e43',
  DASHBOARD = '#b0412a',
  DANGER_ZONE = '#f51b36',
  USER_LOGS = '#6d26a8',
  API = '#1e6d80',
  SERVER = '#8e7d50',
  GIT = '#336048',
  LOCAL = '#4b4a4a',
}

export type PageContainerTitleProps = {
  title: string;
  backgroundColor: PageContainerTitleColors | SettingsSubTitleColors;
  icon: ReactNode;
  level?: 1 | 5 | 4 | 2 | 3 | undefined;
};

const MainTitle: React.FC<PageContainerTitleProps> = (
  props: PageContainerTitleProps,
) => (
  <Row>
    <Col>
      <Avatar
        style={{ backgroundColor: props.backgroundColor }}
        shape="square"
        icon={props.icon}
      />
    </Col>
    <Col style={{ marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' }}>
      <Typography.Title
        style={{
          marginLeft: 5,
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
        level={props.level || 4}
      >
        {' '}
        {props.title}
      </Typography.Title>
    </Col>
  </Row>
);

const SubTitle: React.FC<PageContainerTitleProps> = (
  props: PageContainerTitleProps,
) => (
  <Row>
    <Col>
      <Avatar
        style={{ backgroundColor: props.backgroundColor }}
        shape="square"
        icon={props.icon}
      />
    </Col>
    <Col style={{ marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' }}>
      {props.title}
    </Col>
  </Row>
);

export default {
  MainTitle,
  SubTitle,
};

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

export interface PageTitleProps {
  title: string;
  backgroundColor: TitleColors;
  icon: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  isMain?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const avatarStyle = (backgroundColor: string) => ({ backgroundColor });
const colStyle = { marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' };

/**
 * Page Title Component
 * Displays a title with an icon and colored background
 * Used for page headers and section titles throughout the application
 */
const PageTitleRow: React.FC<PageTitleProps> = ({
  title,
  backgroundColor,
  icon,
  level,
  isMain,
  className,
  style,
}) => (
  <Row className={className} style={style}>
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

/**
 * Main Page Title
 * Used for primary page headings with Typography.Title styling
 */
export const MainTitle: React.FC<PageTitleProps> = (props) => (
  <PageTitleRow {...props} isMain />
);

/**
 * Sub Title
 * Used for section headings with plain text styling
 */
export const SubTitle: React.FC<PageTitleProps> = (props) => (
  <PageTitleRow {...props} />
);

/**
 * Default export for backward compatibility
 */
const PageTitle = {
  MainTitle,
  SubTitle,
};

export default PageTitle;
import { Avatar, Col, Row } from 'antd';
import React, { ReactNode } from 'react';

export interface CardHeaderProps {
  color: string;
  title: string;
  icon: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Card Header Component
 * Displays a header with an icon and title for cards and panels
 * Used throughout the application for consistent card styling
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  color,
  title,
  icon,
  className,
  style,
}) => {
  return (
    <Row className={className} style={style}>
      <Col>
        <Avatar style={{ backgroundColor: color }} shape="square" icon={icon} />
      </Col>
      <Col
        style={{
          marginLeft: 10,
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
      >
        {title}
      </Col>
    </Row>
  );
};

export default CardHeader;
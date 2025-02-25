import { Avatar, Col, Row } from 'antd';
import React, { ReactNode } from 'react';

type CardHeaderProps = {
  color: string;
  title: string;
  icon: ReactNode;
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  color,
  title,
  icon,
}) => {
  return (
    <Row>
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

import { Avatar, Col, Row } from 'antd';
import React, { ReactNode } from 'react';

type CardHeaderProps = {
  color: string;
  title: string;
  icon: ReactNode;
};

export const CardHeader = (props: CardHeaderProps) => {
  return (
    <Row>
      <Col>
        <Avatar
          style={{ backgroundColor: props.color }}
          shape="square"
          icon={props.icon}
        />
      </Col>
      <Col
        style={{
          marginLeft: 10,
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
      >
        {props.title}
      </Col>
    </Row>
  );
};

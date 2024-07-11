import { Col, Row, Typography } from 'antd';
import React from 'react';

type AutomationActionTitleProps = {
  title: string;
  icon: React.ReactNode;
};

const AutomationActionTitle: React.FC<AutomationActionTitleProps> = (props) => {
  return (
    <Row>
      <Col>{props.icon}</Col>
      <Col
        style={{
          marginLeft: 5,
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
      >
        <Typography.Title
          style={{
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
          level={5}
        >
          {' '}
          {props.title}
        </Typography.Title>
      </Col>
    </Row>
  );
};

export default AutomationActionTitle;

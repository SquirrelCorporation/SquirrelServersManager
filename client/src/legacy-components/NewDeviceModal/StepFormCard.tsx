import React from 'react';
import { Avatar, Card, Col, Row, Tooltip } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';

interface StepFormCardProps {
  title: string;
  icon: React.ReactNode;
  tooltip?: string;
  formItems?: {
    name: string;
    label: string;
    placeholder: string;
    rules: any[];
    initialValue?: string;
  }[];
  content?: React.ReactNode;
}

const StepFormCard: React.FC<StepFormCardProps> = ({
  title,
  icon,
  tooltip,
  formItems,
  content,
}) => (
  <Card
    type="inner"
    title={
      <Row>
        <Col>
          <Avatar
            style={{ backgroundColor: '#8e5416' }}
            shape="square"
            icon={icon}
          />
        </Col>
        <Col
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        >
          {title}
        </Col>
      </Row>
    }
    style={{ marginBottom: 10 }}
    extra={
      tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleFilled />
        </Tooltip>
      )
    }
  >
    {formItems ? (
      <ProForm.Group>
        {formItems.map((item) => (
          <ProFormText key={item.name} {...item} />
        ))}
      </ProForm.Group>
    ) : (
      content
    )}
  </Card>
);

export default StepFormCard;

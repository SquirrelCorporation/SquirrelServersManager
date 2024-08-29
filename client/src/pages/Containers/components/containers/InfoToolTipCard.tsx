import {
  CloudSyncOutlined,
  DeploymentUnitOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { Card, Flex, Space, Tag } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type InfoToolTipCardProps = {
  item: API.Container;
};

const InfoToolTipCard: React.FC<InfoToolTipCardProps> = (
  props: InfoToolTipCardProps,
) => {
  return (
    <Card
      size="small"
      title={props.item.name}
      bordered={false}
      style={{ width: 300 }}
    >
      <Flex vertical gap={0}>
        <Space direction="horizontal">
          <DeploymentUnitOutlined /> {props.item.image?.name}{' '}
          {props.item.image?.tag?.value ? (
            <Tag>{props.item.image.tag.value}</Tag>
          ) : (
            ''
          )}
        </Space>
        <Space direction="horizontal">
          <DesktopOutlined /> {props.item.image?.architecture}/
          {props.item.image?.os}
        </Space>
        <Space direction="horizontal">
          <CloudSyncOutlined /> {props.item.image?.registry.name}
        </Space>
      </Flex>
    </Card>
  );
};

export default InfoToolTipCard;

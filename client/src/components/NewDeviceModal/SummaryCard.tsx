import React from 'react';
import { Avatar, Card, Col, Input, Row, Typography } from 'antd';
import { GrommetIconsInstall } from '@/components/Icons/CustomIcons';
import { Flex } from 'antd';

interface SummaryCardProps {
  sshConnection: { [key: string]: any };
  controlNodeConnectionString: { [key: string]: any };
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  sshConnection,
  controlNodeConnectionString,
}) => (
  <Card
    type="inner"
    title={
      <Row>
        <Col>
          <Avatar
            style={{ backgroundColor: '#168e2e' }}
            shape="square"
            icon={<GrommetIconsInstall />}
          />
        </Col>
        <Col
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        >
          Summary
        </Col>
      </Row>
    }
    style={{ marginBottom: 10 }}
  >
    <Flex vertical gap={16}>
      {Object.keys(sshConnection).map((e) => (
        <Row key={e}>
          <Col
            style={{ marginTop: 'auto', marginBottom: 'auto', width: '150px' }}
          >
            <Typography>{e} :</Typography>
          </Col>
          <Col flex="auto">
            <Input
              value={
                e.toLowerCase().indexOf('pass') !== -1 ||
                e.toLowerCase().indexOf('pwd') !== -1
                  ? '••••••'
                  : sshConnection[e]
              }
              disabled
            />
          </Col>
        </Row>
      ))}
      {Object.keys(controlNodeConnectionString).map((e) => (
        <Row key={e} style={{ marginTop: 10 }}>
          <Col
            style={{ marginTop: 'auto', marginBottom: 'auto', width: '150px' }}
          >
            <Typography>{e} :</Typography>
          </Col>
          <Col flex="auto">
            <Input value={controlNodeConnectionString[e]} disabled />
          </Col>
        </Row>
      ))}
    </Flex>
  </Card>
);

export default SummaryCard;

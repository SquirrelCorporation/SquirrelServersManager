import {
  TablerSquareNumber1Filled,
  TablerSquareNumber2Filled,
} from '@/components/Icons/CustomIcons';
import PlaybookAction from '@/pages/Automations/components/PlaybookAction';
import {
  ArrowDownOutlined,
  ClockCircleFilled,
  DockerOutlined,
  PlaySquareOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  DrawerForm,
  ProForm,
  ProFormSelect,
  ProFormDependency,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  Row,
  Space,
  Typography,
} from 'antd';
import { AddCircleOutline } from 'antd-mobile-icons';
import React, { useState } from 'react';
import Cron from 'react-js-cron';

const AutomationEditionDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };
  const items = [
    {
      key: '1',
      label: 'Force Pull',
    },
  ];
  return (
    <>
      <DrawerForm
        title="Automation Editor"
        drawerProps={{
          placement: 'left',
          destroyOnClose: true,
          extra: (
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" onClick={onClose}>
                OK
              </Button>
            </Space>
          ),
        }}
        submitter={{
          render: (_, defaultDoms) => {
            return [
              <Dropdown.Button menu={{ items }} key={'templates'}>
                Templates
              </Dropdown.Button>,
              ...defaultDoms,
            ];
          },
        }}
        trigger={
          <Button type="primary">
            <PlusOutlined />
            Create a new automation
          </Button>
        }
        resize={{
          onResize() {
            console.log('resize!');
          },
          maxWidth: window.innerWidth * 0.8,
          minWidth: 500,
        }}
        open={open}
      >
        <ProForm.Group>
          <Card
            type="inner"
            title={
              <Row>
                <Col>
                  <TablerSquareNumber1Filled
                    style={{ width: '1.8em', height: '1.8em', marginTop: 6 }}
                  />
                </Col>
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
                    Trigger
                  </Typography.Title>
                </Col>
              </Row>
            }
          >
            <ProFormSelect
              name="trigger"
              width="xl"
              rules={[
                {
                  required: true,
                },
              ]}
              tooltip="The triggering event - Only cron based for now"
              placeholder="Choose a trigger event"
              options={[
                { label: 'Cron', value: 'cron', icon: <ClockCircleFilled /> },
              ]}
              fieldProps={{
                optionRender: (option) => (
                  <Space>
                    <span role="img" aria-label={option.data.label as string}>
                      {option.data.icon}
                    </span>
                    {option.data.label}
                  </Space>
                ),
              }}
            />
            <ProFormDependency name={['trigger']}>
              {({ trigger }) => {
                if (trigger === 'cron') {
                  return (
                    <Cron
                      key={'1'}
                      value={''}
                      setValue={() => {}}
                      clearButton={false}
                    />
                  );
                }
              }}
            </ProFormDependency>
          </Card>
          <Flex
            align={'center'}
            justify={'center'}
            style={{ width: 440, marginTop: 5, marginBottom: 5 }}
          >
            <ArrowDownOutlined style={{ fontSize: 30, textAlign: 'center' }} />
          </Flex>
          <Card
            type="inner"
            actions={[<AddCircleOutline key="add" />]}
            title={
              <Row>
                <Col>
                  <TablerSquareNumber2Filled
                    style={{ width: '1.8em', height: '1.8em', marginTop: 6 }}
                  />
                </Col>
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
                    Execute
                  </Typography.Title>
                </Col>
              </Row>
            }
          >
            <ProFormSelect
              rules={[
                {
                  required: true,
                },
              ]}
              width="xl"
              name="action"
              options={[
                {
                  label: 'Playbook',
                  value: 'playbook',
                  icon: <PlaySquareOutlined />,
                },
                {
                  label: 'Docker Action',
                  value: 'docker-action',
                  icon: <DockerOutlined />,
                },
              ]}
              fieldProps={{
                optionRender: (option) => (
                  <Space>
                    <span role="img" aria-label={option.data.label as string}>
                      {option.data.icon}
                    </span>
                    {option.data.label}
                  </Space>
                ),
              }}
              placeholder="Type of action"
            />
            <ProFormDependency name={['action']}>
              {({ action }) => {
                if (action === 'playbook') {
                  return <PlaybookAction />;
                }
              }}
            </ProFormDependency>
          </Card>
        </ProForm.Group>
      </DrawerForm>
    </>
  );
};

export default AutomationEditionDrawer;

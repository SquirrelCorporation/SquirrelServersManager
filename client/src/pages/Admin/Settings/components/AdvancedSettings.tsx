import {
  ConfigurationSolid,
  IonServer,
  PajamasLog,
} from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import AnsibleConfiguration from '@/pages/Admin/Settings/components/subcomponents/AnsibleConfiguration';
import {
  deleteAnsibleLogs,
  deletePlaybooksAndResync,
  deleteServerLogs,
  postRestartServer,
} from '@/services/rest/settings/settings';
import { BugFilled, InfoCircleFilled, RedoOutlined } from '@ant-design/icons';
import { Button, Card, Col, Popover, Row, Typography } from 'antd';
import { DeleteOutline } from 'antd-mobile-icons';
import React from 'react';

const AdvancedSettings: React.FC = () => {
  const purgeLogs = async (type: string) => {
    let purgeFunction;
    switch (type) {
      case 'server':
        purgeFunction = deleteServerLogs;
        break;
      case 'ansible':
        purgeFunction = deleteAnsibleLogs;
        break;
      case 'playbooks':
        purgeFunction = deletePlaybooksAndResync;
        break;
      default:
        return;
    }
    await purgeFunction();
  };

  return (
    <Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Logs'}
            backgroundColor={TitleColors.LOGS_RETENTION}
            icon={<PajamasLog />}
          />
        }
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col flex="auto">
            <Typography.Text>
              <Popover content={'Delete all servers logs from database'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Server logs
            </Typography.Text>
          </Col>
          <Col>
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={() => purgeLogs('server')}
            >
              Purge
            </Button>
          </Col>
        </Row>
        <Row
          gutter={[16, 16]}
          align="middle"
          justify="space-between"
          style={{ marginTop: 16 }}
        >
          <Col flex="auto">
            <Typography.Text>
              <Popover
                content={
                  'Delete all Ansible task & statuses logs from database'
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Ansible tasks & statuses
            </Typography.Text>
          </Col>
          <Col>
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={() => purgeLogs('ansible')}
            >
              Purge
            </Button>
          </Col>
        </Row>
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Server'}
            backgroundColor={TitleColors.SERVER}
            icon={<IonServer />}
          />
        }
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col flex="auto">
            <Typography.Text>
              <Popover content={'Restart the underlying NodeJs server'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Restart Server
            </Typography.Text>
          </Col>
          <Col>
            <Button
              danger
              icon={<RedoOutlined />}
              onClick={async () => await postRestartServer()}
            >
              Restart
            </Button>
          </Col>
        </Row>
      </Card>
      <Card
        type="inner"
        style={{ marginTop: 16 }}
        title={
          <Title.SubTitle
            title={'Debug'}
            backgroundColor={TitleColors.DEBUG}
            icon={<BugFilled />}
          />
        }
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col flex="auto">
            <Typography.Text>
              <Popover content={'Delete all playbooks and resync'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Playbooks
            </Typography.Text>
          </Col>
          <Col>
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={() => purgeLogs('playbooks')}
            >
              Purge & Sync again
            </Button>
          </Col>
        </Row>
      </Card>
      <Card
        type="inner"
        style={{ marginTop: 16 }}
        title={
          <Title.SubTitle
            title={'Ansible Configuration (ansible.cfg)'}
            backgroundColor={TitleColors.ANSIBLE_CONF}
            icon={<ConfigurationSolid />}
          />
        }
      >
        <AnsibleConfiguration />
      </Card>
    </Card>
  );
};

export default AdvancedSettings;

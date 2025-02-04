import { GrommetIconsHost } from '@/components/Icons/CustomIcons';
import { InfoCircleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Avatar, Card, Col, Row, Tooltip } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { SsmAnsible } from 'ssm-shared-lib';

export type HostCardProps = {
  deviceIp?: string;
  showAdvanced: boolean;
};

const HostCard: React.FC<HostCardProps> = ({ deviceIp, showAdvanced }) => (
  <Card
    type="inner"
    title={
      <Row>
        <Col>
          <Avatar
            style={{ backgroundColor: '#4e246a' }}
            shape="square"
            icon={<GrommetIconsHost />}
          />
        </Col>
        <Col
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        >
          Host
        </Col>
      </Row>
    }
    style={{ marginBottom: 10 }}
    extra={
      <Tooltip
        title={
          'Enter the IP and SSH port. Please note that Ipv6 is not supported yet.'
        }
      >
        <InfoCircleFilled />
      </Tooltip>
    }
  >
    <ProForm.Group>
      <ProFormText
        name="deviceIp"
        label="Device IP"
        width="sm"
        placeholder="192.168.0.1"
        disabled={deviceIp !== undefined}
        initialValue={deviceIp}
        rules={[
          { required: true },
          {
            pattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
            message: 'Please enter a valid IP (we do not support v6 yet)',
          },
        ]}
      />
      <ProFormDigit
        name="sshPort"
        label="SSH Port"
        width="xs"
        initialValue={22}
        rules={[
          { required: true },
          { pattern: /^[0-9]+$/, message: 'Please enter a number' },
        ]}
        fieldProps={{ precision: 0 }}
      />
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ProForm.Group>
              <ProFormSwitch
                name="strictHostChecking"
                label="Strict Host Checking"
                initialValue={true}
              />
              <ProFormSelect
                name="sshConnection"
                label="Ansible Connection Method"
                tooltip={'This only controls the Ansible connection method.'}
                initialValue={SsmAnsible.SSHConnection.PARAMIKO}
                rules={[{ required: true }]}
                options={Object.values(SsmAnsible.SSHConnection).map((e) => ({
                  value: e,
                  label: e,
                }))}
              />
            </ProForm.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </ProForm.Group>
  </Card>
);

export default HostCard;

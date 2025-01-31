import { EosIconsAdmin } from '@/components/Icons/CustomIcons';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Avatar, Card, Col, Row, Tooltip } from 'antd';
import React from 'react';
import { SsmAnsible } from 'ssm-shared-lib';

export type SuperUserCardProps = {
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

const SuperUserCard: React.FC<SuperUserCardProps> = ({ formRef }) => (
  <Card
    type="inner"
    title={
      <Row>
        <Col>
          <Avatar
            style={{ backgroundColor: '#37246a' }}
            shape="square"
            icon={<EosIconsAdmin />}
          />
        </Col>
        <Col
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        >
          Super User
        </Col>
      </Row>
    }
    style={{ marginBottom: 10 }}
    extra={
      <Tooltip
        title={
          'SSM will need to elevate privileges for some operations, fill the sudo method and sudo user & password. Passwords are saved using Vault.'
        }
      >
        <InfoCircleFilled />
      </Tooltip>
    }
  >
    <ProForm.Group>
      <ProFormSelect
        label="Sudo Method"
        name="becomeMethod"
        rules={[{ required: true }]}
        width="xs"
        options={Object.values(SsmAnsible.AnsibleBecomeMethod).map((e) => ({
          value: e,
          label: e,
        }))}
      />
      <ProFormText
        name="becomeUser"
        label="Sudo User"
        width="xs"
        placeholder="root"
      />
      <ProFormText.Password
        name="becomePass"
        label="Sudo Password"
        width="sm"
        placeholder="password"
        fieldProps={{
          iconRender: (visible) =>
            typeof formRef.current?.getFieldValue === 'function' &&
            formRef.current?.getFieldValue('becomePass') !== 'REDACTED' ? (
              visible ? (
                <EyeTwoTone />
              ) : (
                <EyeInvisibleOutlined />
              )
            ) : undefined,
          onFocus: () => {
            if (formRef.current?.getFieldValue('becomePass') === 'REDACTED') {
              formRef.current?.setFieldValue('becomePass', '');
            }
          },
          onBlur: () => {
            if (formRef.current?.getFieldValue('becomePass') === '') {
              formRef.current?.resetFields(['becomePass']);
            }
          },
        }}
      />
    </ProForm.Group>
  </Card>
);

export default SuperUserCard;

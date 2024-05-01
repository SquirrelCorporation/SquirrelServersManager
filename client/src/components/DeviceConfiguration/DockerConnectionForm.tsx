import {
  OuiMlCreateAdvancedJob,
  UilDocker,
} from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { InfoCircleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Card, Flex, message, Space, Switch, Tooltip, Upload } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import React from 'react';

export const DockerConnectionForm = (props: any) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const beforeUpload = (file: RcFile) => {
    const isPNG = file.type === 'image/png';
    if (!isPNG) {
      message.error(`${file.name} is not a png file`);
    }
    return isPNG || Upload.LIST_IGNORE;
  };
  return (
    <>
      <Card
        type="inner"
        title={
          <CardHeader
            title={'Docker Engine Host'}
            color={'#328e9f'}
            icon={<UilDocker />}
          />
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 45, minHeight: 45, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
        extra={
          <>
            <Tooltip
              title={
                'Ip of the host cannot be modified. Specify port and eventually enforce http/https.'
              }
            >
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProForm.Group>
          <ProFormText
            name="dockerIp"
            label="Device IP"
            width="sm"
            placeholder="192.168.0.1"
            disabled
            initialValue={props.deviceIp}
            rules={[{ required: true }]}
          />
          <ProFormDigit
            name="dockerPort"
            label="Docker Port"
            width="xs"
            initialValue={3000}
            rules={[
              { required: true },
              {
                pattern: /^[0-9]+$/,
                message: 'Please enter a number',
              },
            ]}
            fieldProps={{ precision: 0 }}
          />
          <ProFormSelect
            label="Protocol"
            name="dockerProtocol"
            rules={[
              {
                required: true,
              },
            ]}
            width="xs"
            initialValue={'auto'}
            options={[
              {
                value: 'auto',
                label: 'auto',
              },
              {
                value: 'http',
                label: 'http',
              },
              {
                value: 'https',
                label: 'https',
              },
            ]}
          />
        </ProForm.Group>
      </Card>
      {showAdvanced && (
        <Card
          type="inner"
          title={
            <CardHeader
              title={'Docker Advanced Connection'}
              color={'#1e4f5a'}
              icon={<OuiMlCreateAdvancedJob />}
            />
          }
          style={{ marginBottom: 10 }}
          styles={{
            header: { height: 45, minHeight: 45, paddingLeft: 15 },
            body: { paddingBottom: 0 },
          }}
          extra={
            <>
              <Tooltip title={'Docker connection with CA, Cert and Key'}>
                <InfoCircleFilled />
              </Tooltip>
            </>
          }
        >
          <ProForm.Group>
            <ProFormUploadButton
              name="ca"
              label="CA"
              title={'Upload'}
              max={1}
              fieldProps={{
                name: 'file',
                //beforeUpload: beforeUpload,
                maxCount: 1,
              }}
            />
            <ProFormUploadButton
              name="cert"
              label="Cert"
              title={'Upload'}
              max={1}
              fieldProps={{
                name: 'file',
                //beforeUpload: beforeUpload,
                maxCount: 1,
              }}
            />
            <ProFormUploadButton
              name="key"
              label="Key"
              title={'Upload'}
              max={1}
              fieldProps={{
                name: 'file',
                //beforeUpload: beforeUpload,
                maxCount: 1,
              }}
            />
          </ProForm.Group>
        </Card>
      )}
      <Flex
        style={{
          marginBottom: 10,
        }}
      >
        <Space
          direction="horizontal"
          size="middle"
          style={{ marginLeft: 'auto' }}
        >
          Show advanced
          <Switch
            size="small"
            value={showAdvanced}
            onChange={() => setShowAdvanced(!showAdvanced)}
          />
        </Space>
      </Flex>
    </>
  );
};

import { DownloadOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { Button, Flex, Input, Modal, Typography, message } from 'antd';
import React, { useState } from 'react';

const connectionTypes = [
  {
    value: '1',
    label: 'User/Password',
  },
  { value: '2', label: 'Keys' },
];

export type NewDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
};
const NewDeviceModal: React.FC<NewDeviceModalProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const [sshConnection, setSshConnection] = useState({});
  const [controlNodeConnectionString, setControlNodeConnectionString] = useState({});

  const checkHostAPI = async (url: string) => {
    await fetch(`${url}/api/ping`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })
      .then((response) => {
        message.success({ content: `Found API at ${url}`, duration: 8 });
      })
      .catch(function (err) {
        message.error({
          content: `Cannot detect API (${err.message}) at ${url}/api/ping, we recommend to edit the previous control node URL`,
          duration: 8,
        });
      });
  };
  const handleCancel = () => {
    props.setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Install agent on device"
        open={props.isModalOpen}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
          </>
        )}
      >
        <ProCard>
          <StepsForm
            onFinish={async () => {
              setLoading(true);
              message.success('提交成功');
              setLoading(false);
            }}
            submitter={{
              render: ({ form, onSubmit, step, onPre }) => {
                return [
                  step > 0 && (
                    <Button
                      key="pre"
                      onClick={() => {
                        if (step === 1) setSshConnection({});
                        if (step === 2) setControlNodeConnectionString({});
                        onPre?.();
                      }}
                    >
                      Back
                    </Button>
                  ),
                  <Button
                    key="next"
                    loading={loading}
                    type="primary"
                    onClick={() => {
                      if (step === 0) setSshConnection(form?.getFieldsValue());
                      if (step === 1) setControlNodeConnectionString(form?.getFieldsValue());
                      onSubmit?.();
                    }}
                    icon={step < 2 ? undefined : <DownloadOutlined />}
                  >
                    {step < 2 ? 'Next' : 'Confirm & Install Agent'}
                  </Button>,
                ];
              },
            }}
            formProps={{
              validateMessages: {
                required: 'This field is required',
              },
            }}
          >
            <StepsForm.StepForm name="base" title="SSH">
              <ProFormText
                name="deviceIp"
                label="Device IP"
                width="md"
                placeholder="192.168.0.1"
                rules={[{ required: true }]}
              />
              <ProFormText
                name="sshPort"
                label="SSH Port"
                width="md"
                placeholder="22"
                rules={[{ required: true }]}
                initialValue={22}
              />
              <ProFormSelect
                label="SSH Connection Type"
                name="sshConnectionType"
                rules={[
                  {
                    required: true,
                  },
                ]}
                initialValue="1"
                width="md"
                options={connectionTypes}
              />
              <ProFormDependency name={['sshConnectionType']}>
                {({ sshConnectionType }) => {
                  if (sshConnectionType === '1')
                    return (
                      <>
                        <ProFormText
                          name="sshUserName"
                          label="SSH User Name"
                          width="sm"
                          placeholder="root"
                          rules={[{ required: true }]}
                        />
                        <ProFormText.Password
                          name="sshPassword"
                          label="SSH Password"
                          width="sm"
                          placeholder="password"
                          rules={[{ required: true }]}
                        />
                      </>
                    );
                  if (sshConnectionType === '2')
                    return (
                      <>
                        <ProFormTextArea
                          name="sshPrivateKey"
                          label="SSH Private Key"
                          width="xl"
                          placeholder="root"
                          rules={[{ required: true }]}
                        />
                      </>
                    );
                }}
              </ProFormDependency>
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="checkbox"
              title="Control Node"
              onFinish={async (formData) => {
                setLoading(true);
                await checkHostAPI(formData['controlNodeURL']);
                setLoading(false);
                return true;
              }}
            >
              <ProForm.Group>
                <ProFormText
                  name="controlNodeURL"
                  label="Control Node URL"
                  width="md"
                  placeholder="http://192.168.0.1:3001"
                  rules={[{ required: true }]}
                  initialValue={`http://${document.location.hostname}:3000`}
                />
              </ProForm.Group>
            </StepsForm.StepForm>
            <StepsForm.StepForm name="confirm" title="Confirm">
              <ProForm.Item label="Connection configuration">
                <Flex vertical gap={16}>
                  {Object.keys(sshConnection).map((e) => (
                    <div key={e}>
                      <Typography style={{ textAlign: 'center' }}>{e} :</Typography>{' '}
                      <Input
                        style={{ textAlign: 'center' }}
                        value={
                          e.toLowerCase().indexOf('password') !== -1 ? '••••••' : sshConnection[e]
                        }
                        disabled
                      />
                    </div>
                  ))}
                </Flex>
              </ProForm.Item>
              <ProForm.Item label="Control Node configuration (.env)">
                <Flex vertical gap={16}>
                  {Object.keys(controlNodeConnectionString).map((e) => (
                    <div key={e}>
                      <Typography style={{ textAlign: 'center' }}>{e} :</Typography>{' '}
                      <Input
                        style={{ textAlign: 'center' }}
                        value={controlNodeConnectionString[e]}
                        disabled
                      />
                    </div>
                  ))}
                </Flex>
              </ProForm.Item>
            </StepsForm.StepForm>
          </StepsForm>
        </ProCard>
      </Modal>
    </>
  );
};

export default NewDeviceModal;

import { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { message, Modal, Tabs, TabsProps } from 'antd';
import React from 'react';
import { ProForm } from '@ant-design/pro-form/lib';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.DeviceItem>;

export type ConfigurationFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<API.DeviceItem>;
};

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve(true);
    }, time);
  });
};
const Configuration : React.FC = () => {

  return (
    <ProForm<{

    }>
      layout="vertical"
      grid={false}
      rowProps={{
        gutter: [16, 0],
      }}
      submitter={{
        render: (props, doms) => {
          return (
            doms
          );
        },
      }}
      onFinish={async (values) => {
        await waitTime(2000);
        console.log(values);
        message.success('提交成功');
      }}
      params={{}}
      request={async () => {
        await waitTime(100);
        return {

        };
      }}
    >
      <ProFormSelect
        label="Engine"
        name="engine"
        initialValue={'Ansible'}
        valueEnum={{
          1: 'Ansible',
        }}
        rules={[
          {
            required: true,
            message: 'Mandatory',
          },
        ]}
      />
      <ProFormSelect
        label="Package Manager"
        name="packageManager"
        initialValue={'APT'}
        valueEnum={{
          1: 'Ansible',
        }}
        rules={[
          {
            required: true,
            message: 'Mandatory',
          },
        ]}
      />
    <ProFormText
      name="shellCli"
      label='Shell CLI'
      initialValue={'$ apt-get upgrade'}
      disabled
      rules={[
        {
          required: true,
          message: 'Mandatory',
        },
      ]}
    />
  <ProFormTextArea
    name="desc"
    label='test2'
    placeholder='testPlace'
    rules={[
      {
        required: true,
        message: 'Mandatory',
        min: 5,
      },
    ]}
  />
    </ProForm>
  );
}

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'SSH',
    children: 'Content of Tab Pane 2',
  },
  {
    key: '2',
    label: 'Update Configuration',
    children: <Configuration/>,
  },
  {
    key: '3',
    label: 'Override',
    children: 'Content of Tab Pane 3',
  },
];

const ConfigurationForm: React.FC<ConfigurationFormProps> = (props) => {
        return (
          <Modal
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title={`${props.values.hostname} (${props.values.ip})`}
            open={props.updateModalOpen}
            //footer={submitter}
            onCancel={() => {
              props.onCancel();
            }}
          >
            <Tabs
              onChange={(key: string) => {
                console.log(key);
              }}
              type="card"
              items={items}
            />
          </Modal>
        );
  ;
};

export default ConfigurationForm;

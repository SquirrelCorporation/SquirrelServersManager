import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import {message, Modal, Tabs, TabsProps} from 'antd';
import React, {useState} from 'react';
import {ProForm} from "@ant-design/pro-form/lib";
import type { FormLayout } from 'antd/lib/form/Form';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.DeviceItem>;

export type UpdateFormProps = {
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
    label: 'Update Configuration',
    children: <Configuration/>,
  },
  {
    key: '2',
    label: 'SSH',
    children: 'Content of Tab Pane 2',
  },
  {
    key: '3',
    label: 'Override',
    children: 'Content of Tab Pane 3',
  },
];

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
        return (
          <Modal
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title="Conf"
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

export default UpdateForm;

import { createUser } from '@/services/rest/user';
import { ProFormDependency, ProFormText } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { history } from '@umijs/max';
import { message } from 'antd';
import React from 'react';

const loginPath = '/user/login';

const CreateUserForm = ({
  width = 'md',
}: {
  width?: number | 'md' | 'xl' | 'lg' | 'sm' | 'xs' | undefined;
}) => (
  <ProForm<{
    name: string;
    email: string;
    password: string;
  }>
    layout="vertical"
    grid={false}
    rowProps={{
      gutter: [16, 0],
    }}
    onFinish={async (values) => {
      await createUser(values.name, values.email, values.password)
        .then(() => {
          history.push(loginPath + '#success');
        })
        .catch((e) => {
          message.error({ content: e.message, duration: 6 });
        });
    }}
  >
    <ProFormText
      name="name"
      label="Enter your name"
      width={width}
      placeholder="John Smith"
      rules={[{ required: true }]}
    />
    <ProFormText
      name="email"
      label="Email"
      width={width}
      placeholder="john.smith@gmail.com"
      rules={[
        { required: true },
        {
          type: 'email',
          message: 'Please enter a valid email',
        },
      ]}
    />
    <ProFormText.Password
      name="password"
      label="Password"
      width={width}
      rules={[
        { required: true },
        {
          pattern:
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
          message:
            'Minimum eight (8) characters, at least one (1) upper case English letter, one (1) lower case English letter, one (1) number and one (1) special character',
        },
      ]}
    />
    <ProFormDependency name={['password']}>
      {({ password }) => {
        return (
          <ProFormText.Password
            name="repeat-password"
            label="Repeat password"
            width={width}
            rules={[
              { required: true },
              {
                validator(_, value) {
                  if (value === password) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Passwords not equal');
                },
              },
            ]}
          />
        );
      }}
    </ProFormDependency>
  </ProForm>
);

export default CreateUserForm;

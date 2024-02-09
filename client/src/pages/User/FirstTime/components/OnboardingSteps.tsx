import { loginPath } from '@/app';
import { GameIconsAcorn } from '@/pages/User/FirstTime';
import { createUser } from '@/services/rest/api';
import { ProFormDependency, ProFormText } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { history } from '@umijs/max';
import { message, Typography } from 'antd';
import React from 'react';

const OnboardingStepsArray = [
  {
    pic: '/logo.svg',
    map: '/onboarding/acorn.png',
    color: 'rgb(31, 31, 31)',
    background: '#282727',
    content: (
      <>
        <br />
        <GameIconsAcorn />
        &nbsp;Squirrel Servers Manager is the solution to the management of your
        multiple servers
        <br /> <br />
        <GameIconsAcorn />
        &nbsp;It provides a beautiful UI & UX for all kind of systems
        <br /> <br />
        <GameIconsAcorn />
        &nbsp;Under the hood, it is powered by Ansible. Some Ansible knowledge
        is required!
        <br /> <br />
        Let&apos; start by creating your user!
      </>
    ),
    title: 'Welcome !',
  },
  {
    pic: '/onboarding/acorn.png',
    map: '/onboarding/tree2.png',
    color: '#565583',
    background: '#322848',
    content: (
      <>
        <br />
        <GameIconsAcorn />
        &nbsp;SSM is &quot;agent based&quot;, which means a small program must
        be installed on each server you wish to manage
        <br /> <br />
        <i>(You can also install it manually on each server thanks to</i>
        <br />
        <Typography.Text style={{ backgroundColor: 'black' }} code>
          cd ./agent && ./install.sh
        </Typography.Text>
        <br />
        But don&apos;t worry, you can do that automatically later from the UI)
      </>
    ),
    title: 'Agent based',
  },
  {
    pic: '/logo.svg',
    map: '/onboarding/thump.png',
    color: '#27864b',
    background: '#115e2a',
    content: (
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
          width="md"
          placeholder="John Smith"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="email"
          label="Email"
          width="md"
          placeholder="john.smith@gmail.com"
          rules={[
            { required: true },
            {
              pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: 'Please enter a valid email',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          label="Password"
          width="md"
          rules={[
            { required: true },
            {
              pattern:
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
              message:
                'Minimum eight characters, at least one upper case English letter, one lower case English letter, one number and one special character',
            },
          ]}
        />
        <ProFormDependency name={['password']}>
          {({ password }) => {
            return (
              <ProFormText.Password
                name="repeat-password"
                label="Repeat password"
                width="md"
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
    ),
    title: 'Create an admin user',
  },
];

export default OnboardingStepsArray;

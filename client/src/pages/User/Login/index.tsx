import { hasUser } from '@/services/rest/api';
import { login } from '@/services/rest/login';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Alert, Divider, message } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
// @ts-ignore
import loginBackground from '@/pages/User/Login/assets/login-background.mp4';
import { API } from 'ssm-shared-lib';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const checkIfFirstTime = async () => {
    await hasUser().then((e) => {
      if (!e.data.hasUsers) {
        history.push('/user/onboarding');
      }
    });
  };
  checkIfFirstTime();

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const msg = await login({ ...values });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = 'Success！';
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      console.log(msg);
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = 'Login failed！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status } = userLoginState;

  return (
    <ProConfigProvider dark>
      <div
        style={{
          backgroundColor: 'white',
          height: '100vh',
        }}
      >
        <LoginFormPage
          backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
          backgroundVideoUrl={loginBackground}
          logo={<img alt="logo" src="/logo.svg" />}
          containerStyle={{
            backgroundColor: 'rgba(0, 0, 0,0.65)',
            backdropFilter: 'blur(4px)',
          }}
          title="Squirrel Servers Manager"
          subTitle="All in one place"
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            searchConfig: {
              submitText: 'Login', //直接配就好啦
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
          actions={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <Divider plain>
                <span
                  style={{
                    // color: token.colorTextPlaceholder,
                    fontWeight: 'normal',
                    fontSize: 14,
                  }}
                >
                  Squirrel Corp
                </span>
              </Divider>
            </div>
          }
        >
          {status === 'error' && (
            <LoginMessage
              content={'Incorrect username/password(admin/ant.design)'}
            />
          )}
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: (
                  <UserOutlined
                    style={
                      {
                        //  color: token.colorText,
                      }
                    }
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'admin or user'}
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={
                      {
                        //  color: token.colorText,
                      }
                    }
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'password'}
              rules={[
                {
                  required: true,
                  message: 'Password required',
                },
              ]}
            />
          </>

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              Remember me
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              Forgot Password ?
            </a>
          </div>
        </LoginFormPage>
      </div>
    </ProConfigProvider>
  );
};

export default Login;

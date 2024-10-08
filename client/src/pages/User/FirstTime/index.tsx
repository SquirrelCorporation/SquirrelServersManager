import { GameIconsAcorn } from '@/components/Icons/CustomIcons';
import { createUser } from '@/services/rest/user';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProConfigProvider,
  ProFormDependency,
  ProFormText,
} from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { history } from '@umijs/max';
import { message, Modal, Typography } from 'antd';
import { Header } from 'antd/es/layout/layout';
import BannerAnim, { Element } from 'rc-banner-anim';
import QueueAnim from 'rc-queue-anim';
import { TweenOneGroup } from 'rc-tween-one';
import React from 'react';
import Confetti from 'react-confetti';

const loginPath = '/user/login';

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

const FirstTime: React.FC = () => {
  const bannerImg = React.useRef<BannerAnim<unknown> | null>();
  const bannerText = React.useRef<BannerAnim<unknown> | null>();
  const [animState, setAnimState] = React.useState({
    imgAnim: [
      { translateX: [0, 300], opacity: [1, 0] },
      { translateX: [0, -300], opacity: [1, 0] },
    ],
  });
  const [delay, setDelay] = React.useState(0);
  const [showInt, setShowInt] = React.useState(0);
  const [confetty, setConfetty] = React.useState(true);

  const [oneEnter, setOneEnter] = React.useState(false);
  const onChange = () => {
    if (!oneEnter) {
      setDelay(300);
      setOneEnter(true);
    }
  };
  setTimeout(() => {
    setConfetty(false);
  }, 5000);

  const onLeft = () => {
    let _showInt = showInt - 1;
    const imgAnim = [
      { translateX: [0, -300], opacity: [1, 0] },
      { translateX: [0, 300], opacity: [1, 0] },
    ];
    if (_showInt <= 0) {
      _showInt = 0;
    }
    setShowInt(_showInt);
    setAnimState({ imgAnim });
    if (bannerImg.current && bannerText.current) {
      // @ts-ignore
      bannerImg.current.prev();
      // @ts-ignore
      bannerText.current.prev();
    }
  };

  const onRight = () => {
    let _showInt = showInt + 1;
    const imgAnim = [
      { translateX: [0, 300], opacity: [1, 0] },
      { translateX: [0, -300], opacity: [1, 0] },
    ];
    if (_showInt > OnboardingStepsArray.length - 1) {
      _showInt = OnboardingStepsArray.length - 1;
    }
    setShowInt(_showInt);
    setAnimState({ imgAnim });
    if (bannerImg.current && bannerText.current) {
      // @ts-ignore
      bannerImg.current.next();
      // @ts-ignore
      bannerText.current.next();
    }
  };

  const getDuration = (e: any) => {
    if (e.key === 'map') {
      return 800;
    }
    return 1000;
  };

  return (
    <ProConfigProvider dark>
      <Confetti recycle={confetty} />
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
      </Header>
      <Modal
        open
        width={1000}
        title={'Welcome to Squirrel Servers Manager !'}
        footer={() => <></>}
      >
        <PageContainer>
          <div
            className={`details-switch-demo-wrapper`}
            style={{ background: OnboardingStepsArray[showInt].background }}
          >
            <BannerAnim
              prefixCls={`details-switch-demo-img-wrapper`}
              sync
              type="across"
              duration={1000}
              ease="easeInOutExpo"
              arrow={false}
              thumb={false}
              ref={(c) => {
                bannerImg.current = c;
              }}
              onChange={onChange}
              dragPlay={false}
            >
              {OnboardingStepsArray.map((item, i) => {
                return (
                  <Element
                    key={`key-${i}`}
                    style={{
                      background: item.color,
                      height: '100%',
                    }}
                    leaveChildHide
                  >
                    <QueueAnim
                      animConfig={animState.imgAnim}
                      duration={getDuration}
                      delay={[!i ? delay : 300, 0]}
                      ease={['easeOutCubic', 'easeInQuad']}
                      key="img-wrapper"
                    >
                      <div
                        className={`details-switch-demo-map map${i}`}
                        key="map"
                      >
                        <img src={item.map} width="100%" alt={'img'} />
                      </div>
                      <div
                        className={`details-switch-demo-pic pic${i}`}
                        key="pic"
                      >
                        <img src={item.pic} width="100%" alt={'img'} />
                      </div>
                    </QueueAnim>
                  </Element>
                );
              })}
            </BannerAnim>
            <BannerAnim
              prefixCls={`details-switch-demo-text-wrapper`}
              sync
              type="across"
              duration={1000}
              arrow={false}
              thumb={false}
              ease="easeInOutExpo"
              ref={(c: any) => {
                bannerText.current = c;
              }}
              dragPlay={false}
            >
              {OnboardingStepsArray.map((item, i) => {
                return (
                  <Element key={i}>
                    <QueueAnim
                      type="bottom"
                      duration={1000}
                      delay={[!i ? delay + 500 : 800, 0]}
                    >
                      <Typography.Title level={1} key="h1">
                        {item.title}
                      </Typography.Title>
                      <em
                        key="em"
                        style={{ backgroundColor: item.background }}
                      />
                      <Typography.Text key="p">{item.content}</Typography.Text>
                    </QueueAnim>
                  </Element>
                );
              })}
            </BannerAnim>
            <div className={'details-switch-demo'}>
              <TweenOneGroup
                enter={{ opacity: 0, type: 'from' }}
                leave={{ opacity: 0 }}
              >
                {showInt > 0 && <LeftOutlined key="left" onClick={onLeft} />}
                {showInt < OnboardingStepsArray.length - 1 && (
                  <RightOutlined key="right" onClick={onRight} />
                )}
              </TweenOneGroup>
            </div>
          </div>
        </PageContainer>
      </Modal>
    </ProConfigProvider>
  );
};

export default FirstTime;

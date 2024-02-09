import OnboardingStepsArray from '@/pages/User/FirstTime/components/OnboardingSteps';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { PageContainer, ProConfigProvider } from '@ant-design/pro-components';
import { Modal, Typography } from 'antd';
import { Header } from 'antd/es/layout/layout';
import BannerAnim, { Element } from 'rc-banner-anim';
import QueueAnim from 'rc-queue-anim';
import { TweenOneGroup } from 'rc-tween-one';
import React from 'react';
import Confetti from 'react-confetti';

export const GameIconsAcorn = (props: any) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="currentColor"
      d="M422.625 18.28c-24.68.13-51.932 15.455-74.094 36.907c1.868 1.036 3.742 2.07 5.626 3.157a396.997 396.997 0 0 1 22.72 14.125c25.19-9.583 55.47-14.465 103.437-2.97c-12.036-37.07-33.633-51.345-57.688-51.22zM237.78 40.22l28.97 94.25c12.57 6.443 24.827 13.41 36.813 20.843l-36.625-111.97c-8.476-1.68-16.657-2.662-24.563-3c-1.54-.065-3.074-.108-4.594-.124zm-19.218 1.124a136.71 136.71 0 0 0-4.78.687a133.758 133.758 0 0 0-25.595 6.876l15.688 58.625a492.05 492.05 0 0 1 39.906 15.907l-25.218-82.093zm69.875 7.593l40.157 122.876c15.922 11.124 31.32 23.128 46.25 35.906L325.906 64.374c-13.092-6.527-25.568-11.643-37.47-15.438zm-117.5 7.844c-14.657 7.857-28.523 18.348-41.875 31.095a496.901 496.901 0 0 1 53.657 12.813zm179.25 20.907l53.282 155.97c10.798 10.382 21.322 21.187 31.624 32.374c.395-1.174.75-2.332 1.125-3.5L379.843 97.407c-8.84-6.63-18.706-13.185-29.656-19.72zM136.595 108.25c-17.05 11.436-32.43 27.876-45.344 50.22c-42.303 73.19-61.83 198.325-24.53 265.717l-.064-.062c.752 23.392-7.597 45.63-17.812 67.594c27.268-12.192 54.897-17.815 82.687-20.783l-.468-.343c87.895 19.01 212.87-49.42 260.688-132.156c13.547-23.44 20.606-46.14 22.28-67.72c-77.218-81.572-166.868-139.912-277.436-162.468zm271.469 14L444.188 228c2.638-20.573.96-39.855-5.688-58.25c-5.856-16.202-15.717-32.01-30.438-47.5z"
    />
  </svg>
);

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

  const [oneEnter, setOneEnter] = React.useState(false);
  const onChange = () => {
    if (!oneEnter) {
      setDelay(300);
      setOneEnter(true);
    }
  };

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
      <Confetti />
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

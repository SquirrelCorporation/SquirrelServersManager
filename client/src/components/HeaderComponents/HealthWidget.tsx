import HeaderDropdown from '@/components/HeaderDropdown';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel } from '@umijs/max';
import {
  Avatar,
  Badge,
  DropdownProps,
  MenuProps,
  Popover,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

export const HealthWidget: React.FC = () => {
  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const { initialState } = useModel('@@initialState');

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );
  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.devices) {
    return loading;
  }
  const FluentMdl2Health = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 2048 2048"
      {...props}
    >
      <path
        fill="currentColor"
        d="M347 1024h-39l716 716l588-588h181l-769 769l-865-864q-35-35-62-75t-47-86h243l283-282l448 447l320-319l155 154h355q32-51 49-108t17-117q0-87-32-162t-89-130t-132-87t-163-32q-84 0-149 26t-120 70t-105 97t-106 111q-54-54-105-109t-106-99t-121-72t-148-28q-86 0-161 32t-132 89t-89 132t-33 162q0 47 11 97H9q-5-24-6-48t-2-48q0-113 42-212t116-173t173-116t212-43q83 0 148 19t120 52t106 81t106 103q55-56 105-103t106-80t121-53t148-19q112 0 211 42t172 116t116 172t43 211q0 97-34 188t-97 167h-470l-101-102l-320 321l-448-449l-229 230z"
      />
    </svg>
  );

  return (
    <>
      <Popover
        content={`System performance : ${currentUser?.systemPerformance?.message}`}
      >
        <Badge dot={currentUser?.systemPerformance?.danger} offset={[0, 10]}>
          <Avatar
            src={
              <FluentMdl2Health
                className={'svg-small-anim-pulse'}
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
              />
            }
          />
        </Badge>
      </Popover>
    </>
  );
};

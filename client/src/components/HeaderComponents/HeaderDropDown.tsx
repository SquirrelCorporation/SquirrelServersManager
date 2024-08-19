import React from 'react';
import classNames from 'classnames';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Dropdown } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?:
    | 'bottomLeft'
    | 'bottomRight'
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName,
  ...restProps
}) => {
  const className = useEmotionCss(({ token }) => ({
    [`@media screen and (max-width: ${token.screenXS}px)`]: {
      width: '100%',
    },
  }));

  return (
    <Dropdown
      overlayClassName={classNames(className, overlayClassName)}
      {...restProps}
    />
  );
};

export default HeaderDropdown;

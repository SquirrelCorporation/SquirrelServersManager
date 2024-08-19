import {
  CaretDownFilled,
  CaretRightOutlined,
  CaretUpFilled,
} from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';
import styles from './Trend.less';

interface TrendProps extends React.HTMLAttributes<HTMLDivElement> {
  colorful?: boolean;
  reverseColor?: boolean;
  flag?: 'up' | 'down' | 'eq';
  className?: string;
  children: React.ReactNode;
}

const Trend: React.FC<TrendProps> = ({
  colorful = true,
  reverseColor = true,
  flag,
  children,
  className,
  ...rest
}) => {
  const classString = classNames(
    styles.trendItem,
    {
      [styles.trendItemGrey]: !colorful,
      [styles.reverseColor]: reverseColor && colorful,
    },
    className,
  );

  return (
    <div
      {...rest}
      className={classString}
      title={typeof children === 'string' ? children : ''}
    >
      <span>{children}</span>
      {flag && (
        <span className={styles[flag]}>
          {flag === 'up' && <CaretUpFilled />}
          {flag === 'down' && <CaretDownFilled />}
          {flag === 'eq' && <CaretRightOutlined />}
        </span>
      )}
    </div>
  );
};

export default React.memo(Trend);

import {
  CaretDownFilled,
  CaretRightOutlined,
  CaretUpFilled,
} from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';
import styles from './TrendIndicator.less';

interface TrendIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  colorful?: boolean;
  reverseColor?: boolean;
  flag?: 'up' | 'down' | 'eq';
  className?: string;
  children: React.ReactNode;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
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

export default React.memo(TrendIndicator);

import {
  CaretDownFilled,
  CaretRightOutlined,
  CaretUpFilled,
} from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';
import styles from './Trend.less';

const Trend: React.FC<any> = ({
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

export default Trend;

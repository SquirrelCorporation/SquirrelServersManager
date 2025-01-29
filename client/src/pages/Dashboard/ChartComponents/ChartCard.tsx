import { Skeleton, Typography } from 'antd';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import styles from './ChartCard.less';

const renderTotal = (total: any) => {
  if (total === undefined) {
    return null;
  }
  return (
    <div className={styles.total}>
      <Typography.Text style={{ fontSize: '26px' }}>
        {typeof total === 'function' ? total() : total}
      </Typography.Text>
    </div>
  );
};

const ChartCard: React.FC<any> = ({
  contentHeight,
  title,
  avatar,
  action,
  total,
  footer,
  children,
  loading,
}) => {
  const totalDom = useMemo(() => renderTotal(total), [total]);

  if (loading) {
    return <Skeleton active className={styles.chartCard} />;
  }

  return (
    <div className={styles.chartCard}>
      <div
        className={classNames(styles.chartTop, {
          [styles.chartTopMargin]: !children && !footer,
        })}
      >
        <div className={styles.avatar}>{avatar}</div>
        <div className={styles.metaWrap}>
          <div className={styles.meta}>
            <span className={styles.title}>{title}</span>
            <span className={styles.action}>{action}</span>
          </div>
          {totalDom}
        </div>
      </div>
      {children && (
        <div
          className={styles.content}
          style={{ height: contentHeight || 'auto' }}
        >
          <div className={contentHeight ? styles.contentFixed : ''}>
            {children}
          </div>
        </div>
      )}
      {footer && (
        <div
          className={classNames(styles.footer, {
            [styles.footerMargin]: !children,
          })}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChartCard);

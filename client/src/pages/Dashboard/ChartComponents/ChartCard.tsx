import { Skeleton, Typography } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './ChartCard.less';

const renderTotal = (total: any) => {
  let totalDom;
  switch (typeof total) {
    case 'undefined':
      totalDom = null;
      break;
    case 'function':
      totalDom = (
        <div className={styles.total}>
          <Typography.Title level={3}>{total()}</Typography.Title>
        </div>
      );
      break;
    default:
      totalDom = (
        <div className={styles.total}>
          <Typography.Title level={3}>{total}</Typography.Title>
        </div>
      );
  }
  return totalDom;
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
          {renderTotal(total)}
        </div>
      </div>
      {children && (
        <div
          className={styles.content}
          style={{ height: contentHeight || 'auto' }}
        >
          <div className={contentHeight && styles.contentFixed}>{children}</div>
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
export default ChartCard;

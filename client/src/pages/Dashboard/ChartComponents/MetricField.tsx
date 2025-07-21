import React from 'react';
import styles from './MetricField.less';

interface MetricFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
}

const MetricField: React.FC<MetricFieldProps> = ({ label, value, ...rest }) => {
  return (
    <div className={styles.field} {...rest}>
      <span className={styles.label}>{label}</span>
      <span className={styles.number}>{value}</span>
    </div>
  );
};

export default React.memo(MetricField);

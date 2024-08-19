import React from 'react';
import styles from './Field.less';

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, value, ...rest }) => {
  return (
    <div className={styles.field} {...rest}>
      <span className={styles.label}>{label}</span>
      <span className={styles.number}>{value}</span>
    </div>
  );
};

export default React.memo(Field);

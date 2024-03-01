import React from 'react';
import { Progress, Tooltip } from 'antd';
import styles from './MiniProgress.less';

const MiniProgress: React.FC<any> = ({
  targetLabel,
  target,
  color = 'rgb(19, 194, 194)',
  strokeWidth,
  percent,
}) => {
  return (
    <Progress
      percent={percent}
      status="active"
      strokeColor={{ from: '#108ee9', to: '#87d068' }}
    />
  );
};

export default MiniProgress;

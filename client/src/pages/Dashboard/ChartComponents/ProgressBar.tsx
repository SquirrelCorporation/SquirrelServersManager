import { Progress } from 'antd';
import React from 'react';

interface ProgressBarProps {
  percent: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => {
  return (
    <Progress
      percent={percent}
      status="active"
      strokeColor={{ from: '#108ee9', to: '#87d068' }}
    />
  );
};

export default React.memo(ProgressBar);

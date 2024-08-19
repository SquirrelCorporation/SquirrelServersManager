import { Progress } from 'antd';
import React from 'react';

interface MiniProgressProps {
  percent: number;
}

const MiniProgress: React.FC<MiniProgressProps> = ({ percent }) => {
  return (
    <Progress
      percent={percent}
      status="active"
      strokeColor={{ from: '#108ee9', to: '#87d068' }}
    />
  );
};

export default React.memo(MiniProgress);

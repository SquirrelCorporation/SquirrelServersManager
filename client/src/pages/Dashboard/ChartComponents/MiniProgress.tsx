import { Progress } from 'antd';
import React from 'react';

const MiniProgress: React.FC<any> = ({ percent }) => {
  return (
    <Progress
      percent={percent}
      status="active"
      strokeColor={{ from: '#108ee9', to: '#87d068' }}
    />
  );
};

export default MiniProgress;

import React from 'react';
import { Progress, Tooltip } from 'antd';

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

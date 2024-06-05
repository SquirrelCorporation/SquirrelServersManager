import { TaskStatusTimelineType } from '@/components/TerminalModal/TerminalHandler';
import { StepsProps } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  QuestionOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import React, { ReactNode } from 'react';
import { API } from 'ssm-shared-lib';

const transformToTaskStatusTimeline = (
  execStatus: API.ExecStatus,
): TaskStatusTimelineType => {
  //  status?: 'wait' | 'process' | 'finish' | 'error';
  let status: StepsProps['status'] = undefined;
  let icon: ReactNode = <QuestionOutlined />;
  if (execStatus.status === 'starting') {
    status = 'finish';
    icon = <VerticalAlignBottomOutlined />;
  }
  if (execStatus.status === 'running') {
    status = 'process';
    icon = <LoadingOutlined />;
  }
  if (execStatus.status === 'failed') {
    status = 'error';
    icon = <CloseCircleOutlined />;
  }
  if (execStatus.status === 'successful') {
    status = 'finish';
    icon = <CheckCircleOutlined />;
  }

  return {
    status: status,
    _status: execStatus.status,
    icon: icon,
    title: execStatus.status,
  };
};

export default {
  transformToTaskStatusTimeline,
};

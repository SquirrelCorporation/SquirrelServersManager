import { TaskStatusTimelineType } from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  QuestionOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { StepsProps } from 'antd';
import React, { ReactNode } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

const transformToTaskStatusTimeline = (
  execStatus: API.ExecStatus,
): TaskStatusTimelineType => {
  //  status?: 'wait' | 'process' | 'finish' | 'error';
  let status: StepsProps['status'] = undefined;
  let icon: ReactNode = <QuestionOutlined />;
  if (execStatus.status === SsmAnsible.AnsibleTaskStatus.STARTING) {
    status = 'finish';
    icon = <VerticalAlignBottomOutlined />;
  }
  if (execStatus.status === SsmAnsible.AnsibleTaskStatus.RUNNING) {
    status = 'process';
    icon = <LoadingOutlined />;
  }
  if (
    execStatus.status === SsmAnsible.AnsibleTaskStatus.FAILED ||
    execStatus.status === SsmAnsible.AnsibleTaskStatus.CANCELED ||
    execStatus.status === SsmAnsible.AnsibleTaskStatus.TIMEOUT
  ) {
    status = 'error';
    icon = <CloseCircleOutlined />;
  }
  if (execStatus.status === SsmAnsible.AnsibleTaskStatus.SUCCESS) {
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

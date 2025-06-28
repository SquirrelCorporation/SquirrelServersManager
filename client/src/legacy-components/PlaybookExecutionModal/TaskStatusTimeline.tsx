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
  let status: string = 'created';
  if (execStatus.status === SsmAnsible.AnsibleTaskStatus.STARTING) {
    status = 'finish';
  }
  if (execStatus.status === SsmAnsible.AnsibleTaskStatus.RUNNING) {
    status = 'process';
  }
  if (
    execStatus.status === SsmAnsible.AnsibleTaskStatus.FAILED ||
    execStatus.status === SsmAnsible.AnsibleTaskStatus.CANCELED ||
    execStatus.status === SsmAnsible.AnsibleTaskStatus.TIMEOUT
  ) {
    status = 'error';
  }
  if (execStatus.status === SsmAnsible.AnsibleTaskStatus.SUCCESS) {
    status = 'finish';
  }

  return {
    status: execStatus.status,
    title: execStatus.status,
  };
};

export default {
  transformToTaskStatusTimeline,
};

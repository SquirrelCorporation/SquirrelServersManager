import {StepsProps} from "antd";
import {CloseCircleOutlined, LoadingOutlined, QuestionOutlined, VerticalAlignBottomOutlined} from "@ant-design/icons";
import React, {ReactNode} from "react";
import {TaskStatusTimelineType} from "@/components/TerminalModal/index";

const isFinalStatus = (status : string): boolean => {
    return (status === 'failed' || status === 'success');
}
const transformToTaskStatusTimeline = (execStatus : API.ExecStatus) : TaskStatusTimelineType => {
    //  status?: 'wait' | 'process' | 'finish' | 'error';
    let status: StepsProps['status'] = undefined;
    let icon: ReactNode = <QuestionOutlined />;
    if (execStatus.status === 'starting') { status = 'finish'; icon = <VerticalAlignBottomOutlined />;}
    if (execStatus.status === 'running') { status = 'process'; icon = <LoadingOutlined />; }
    if (execStatus.status === 'failed') { status = 'error'; icon = <CloseCircleOutlined />; }

    return {
        status: status,
        _status: execStatus.status,
        icon: icon,
        title: execStatus.status,
    }
};

export default {
    transformToTaskStatusTimeline,
    isFinalStatus
};

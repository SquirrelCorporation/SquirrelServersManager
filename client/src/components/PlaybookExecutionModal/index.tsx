import TerminalCoreModal, {
  PlaybookExecutionTerminalModalHandles,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionTerminalModal';
import {
  executePlaybook,
  executePlaybookByQuickRef,
} from '@/services/rest/playbooks';
import { message } from 'antd';
import React, { RefObject, useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

export type TerminalStateProps = {
  isOpen: boolean;
  command?: string;
  playbookName?: string;
  quickRef?: string;
  target?: API.DeviceItem[];
  extraVars?: API.ExtraVars;
};

export type TerminalModalProps = {
  terminalProps: TerminalStateProps & {
    setIsOpen: (open: boolean) => void;
  };
};

const TerminalModal = (props: TerminalModalProps) => {
  const [execId, setExecId] = React.useState('');
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const ref: RefObject<PlaybookExecutionTerminalModalHandles> =
    React.createRef<PlaybookExecutionTerminalModalHandles>();

  const startTerminal = async () => {
    ref.current?.resetTerminal();
    ref.current?.resetScreen();
    if (!props.terminalProps.command && !props.terminalProps.quickRef) {
      message.error({
        type: 'error',
        content: 'Error running playbook (internal)',
        duration: 8,
      });
      return;
    }
    try {
      const res = !props.terminalProps.quickRef
        ? await executePlaybook(
            props.terminalProps.command as string,
            props.terminalProps.target?.map((e) => e.uuid),
            props.terminalProps.extraVars,
          )
        : await executePlaybookByQuickRef(
            props.terminalProps.quickRef,
            props.terminalProps.target?.map((e) => e.uuid),
            props.terminalProps.extraVars,
          );
      setExecId(res.data.execId);
      message.loading({
        content: `Playbook is running with id "${res.data.execId}"`,
        duration: 8,
      });
      setIsPollingEnabled(true);
    } catch (error: any) {
      message.error({
        type: 'error',
        content: 'Error running playbook',
        duration: 8,
      });
    }
  };

  useEffect(() => {
    if (props.terminalProps.isOpen && !isPollingEnabled) {
      void startTerminal();
    }
  }, [props.terminalProps.isOpen]);

  return (
    <>
      <TerminalCoreModal
        ref={ref}
        execId={execId}
        startTerminal={startTerminal}
        isOpen={props.terminalProps.isOpen}
        displayName={
          props.terminalProps.quickRef ||
          props.terminalProps.playbookName ||
          'Unknown'
        }
        setIsOpen={props.terminalProps.setIsOpen}
        isPollingEnabled={isPollingEnabled}
        setIsPollingEnabled={setIsPollingEnabled}
      />
    </>
  );
};
export default TerminalModal;

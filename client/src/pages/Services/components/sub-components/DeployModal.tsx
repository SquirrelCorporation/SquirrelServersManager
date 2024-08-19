import TerminalCoreModal, {
  PlaybookExecutionTerminalModalHandles,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionTerminalModal';
import { postDeploy } from '@/services/rest/services';
import { message } from 'antd';
import React, { RefObject, useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

export type DeployModalProps = {
  data: API.Template & API.Targets;
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
};

const DeployModal: React.FC<DeployModalProps> = ({
  data,
  setIsOpen,
  isOpen,
}) => {
  const [execId, setExecId] = React.useState('');
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const ref: RefObject<PlaybookExecutionTerminalModalHandles> =
    React.createRef<PlaybookExecutionTerminalModalHandles>();

  const startTerminal = async () => {
    ref.current?.resetTerminal();
    ref.current?.resetScreen();
    try {
      const res = await postDeploy(data);
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
    if (isOpen && !isPollingEnabled) {
      void startTerminal();
    }
  }, [isOpen]);

  return (
    <>
      <TerminalCoreModal
        ref={ref}
        execId={execId}
        startTerminal={startTerminal}
        isOpen={isOpen}
        displayName={'Unknown'}
        setIsOpen={setIsOpen}
        isPollingEnabled={isPollingEnabled}
        setIsPollingEnabled={setIsPollingEnabled}
      />
    </>
  );
};

export default DeployModal;

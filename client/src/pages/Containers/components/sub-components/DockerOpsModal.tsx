import TerminalCoreModal, {
  PlaybookExecutionTerminalModalHandles,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionTerminalModal';
import { message } from '@shared/ui/feedback/DynamicMessage';
import React, { RefObject, useEffect, useState } from 'react';

export type DockerOpsModalProps = {
  data: any;
  call: (_: any) => Promise<any>;
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
  displayName: string;
};

const DockerOpsModal: React.FC<DockerOpsModalProps> = ({
  data,
  call,
  setIsOpen,
  isOpen,
  displayName,
}) => {
  const [execId, setExecId] = React.useState('');
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const ref: RefObject<PlaybookExecutionTerminalModalHandles> =
    React.createRef<PlaybookExecutionTerminalModalHandles>();

  const startTerminal = async () => {
    ref.current?.resetTerminal();
    ref.current?.resetScreen();
    try {
      const res = await call(data);
      setExecId(res.data.execId);
      message.loading({
        content: `Playbook is running with id "${res.data.execId}"`,
        duration: 8,
      });
      setIsPollingEnabled(true);
    } catch {
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
        displayName={displayName}
        setIsOpen={setIsOpen}
        isPollingEnabled={isPollingEnabled}
        setIsPollingEnabled={setIsPollingEnabled}
      />
    </>
  );
};

export default DockerOpsModal;

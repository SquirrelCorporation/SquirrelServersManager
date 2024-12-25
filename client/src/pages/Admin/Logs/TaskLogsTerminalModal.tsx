import TerminalCoreModal, {
  PlaybookExecutionTerminalModalHandles,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionTerminalModal';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { getTaskEventsLogs } from '@/services/rest/logs';
import { Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

type TaskLogsTerminalModalProps = {
  task: API.Task;
};

const TaskLogsTerminalModal: React.FC<TaskLogsTerminalModalProps> = ({
  task,
}) => {
  const terminalRef = useRef<TerminalCoreHandles>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      terminalRef?.current?.resetTerminalContent();
      getTaskEventsLogs(task.ident).then((res) => {
        if (!res.data || res.data.length === 0) {
          terminalRef?.current?.onDataIn(
            'No logs to show.\nSelected a higher retention period for "Ansible tasks & statuses retention in seconds" in Settings > General Settings',
            true,
          );
          return;
        }
        terminalRef?.current?.onDataIn(
          '---\n' +
            '#  ,;;:;,\n' +
            '#   ;;;;;\n' +
            "#  ,:;;:;    ,'=.\n" +
            "#  ;:;:;' .=\" ,'_\\\n" +
            "#  ':;:;,/  ,__:=@\n" +
            "#   ';;:;  =./)_\n" +
            '#     `"=\\_  )_"`\n' +
            '#          ``\'"`\n' +
            '# Squirrel Servers Manager Playbooks Executor\n' +
            '---\n',
        );
        for (const line of res.data) {
          if (line.stdout) {
            terminalRef?.current?.onDataIn(line.stdout, true);
          }
        }
      });
    }
  }, [isOpen, task.ident]);

  return (
    <>
      <a
        key="view"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Show logs
      </a>
      <Modal
        open={isOpen}
        title={''}
        onOk={() => {
          setIsOpen(false);
        }}
        onCancel={() => {
          setIsOpen(false);
        }}
        width={1000}
      >
        <div style={{ height: '500px' }}>
          <TerminalCore
            ref={terminalRef}
            disableStdin={true}
            rows={35}
            cols={130}
            convertEol={true}
          />
        </div>
      </Modal>
    </>
  );
};

export default TaskLogsTerminalModal;

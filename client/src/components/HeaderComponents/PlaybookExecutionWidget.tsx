import React, { useState, useEffect, useRef } from 'react';
import PlaybookExecutionTerminalModal from '@/components/PlaybookExecutionModal/PlaybookExecutionTerminalModal';
import PlaybookExecutionHandler from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import { SsmAnsible } from 'ssm-shared-lib';
import { EventEmitter } from 'events';
import styles from './PlaybookExecutionWidget.less';
import { notification, Popover, Typography } from 'antd';
import { Smart } from '@/components/Icons/CustomIcons';

// Global event emitter for playbook execution events
export const playbookExecutionEvents = new EventEmitter();

// Event types
export const PLAYBOOK_EXECUTION_START = 'playbook:execution:start';
export const PLAYBOOK_EXECUTION_STATUS = 'playbook:execution:status';
export const PLAYBOOK_EXECUTION_END = 'playbook:execution:end';

interface PlaybookExecutionEvent {
  execId: string;
  displayName: string;
}

const PlaybookExecutionWidget: React.FC = () => {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [execId, setExecId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [status, setStatus] = useState<string>('created');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [executionFinished, setExecutionFinished] = useState<boolean>(false);
  const terminalModalRef = useRef(null);

  useEffect(() => {
    // Listen for playbook execution events
    const onPlaybookStart = (event: PlaybookExecutionEvent) => {
      setExecId(event.execId);
      setDisplayName(event.displayName);
      setIsExecuting(true);
      setExecutionFinished(false);
      setStatus('created');
      // Show notification
      if (window.playbookHandler) {
        window.playbookHandler.showExecutionNotification(event.displayName);
      }
    };
    const onPlaybookStatus = (newStatus: string, isFinal: boolean) => {
      setStatus(newStatus);
      // Update notification
      if (window.playbookHandler) {
        window.playbookHandler.updateExecutionNotification(newStatus, isFinal);
      }
      if (isFinal) {
        setExecutionFinished(true);
        // Keep executing true so widget remains visible
      }
    };
    const onPlaybookEnd = () => {
      setIsExecuting(false);
      setExecutionFinished(false);
    };
    playbookExecutionEvents.on(PLAYBOOK_EXECUTION_START, onPlaybookStart);
    playbookExecutionEvents.on(PLAYBOOK_EXECUTION_STATUS, onPlaybookStatus);
    playbookExecutionEvents.on(PLAYBOOK_EXECUTION_END, onPlaybookEnd);
    window.playbookHandler = new PlaybookExecutionHandler(
      setIsExecuting,
      undefined,
      undefined,
      (newStatus: string, isFinal: boolean) => {
        playbookExecutionEvents.emit(
          PLAYBOOK_EXECUTION_STATUS,
          newStatus,
          isFinal,
        );
      },
    );
    // Notification event listener
    const onNotification = (payload: any) => {
      notification.open({
        key: 'playbook-execution',
        message:
          payload.type === 'info'
            ? payload.message
            : `Playbook execution ${payload.type === 'success' ? 'completed' : 'failed'}`,
        description: (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'transparent',
            }}
          >
            <img
              src="/squirrels/happy-fox.svg"
              alt="Happy Fox"
              style={{ height: 60, marginRight: 12 }}
            />
            <span className={styles['shimmer-text']}>
              {payload.type === 'info'
                ? 'Execution in progress...'
                : payload.message}
            </span>
          </div>
        ),
        duration: 6,
        placement: 'bottomRight',
      });
    };
    playbookExecutionEvents.on(
      'playbook:execution:notification',
      onNotification,
    );
    const onSmartFailure = (payload: { cause: string; resolution: string }) => {
      notification.open({
        key: 'notification-failed',
        message: 'The playbook execution failed',
        duration: 0,
        description: (
          <Typography.Paragraph>
            <b>Probable cause</b>: {payload.cause}
            <br />
            <b>Probable Resolution</b>: {payload.resolution}
          </Typography.Paragraph>
        ),
        icon: <Smart />,
      });
    };
    playbookExecutionEvents.on(
      'playbook:execution:smart-failure',
      onSmartFailure,
    );
    return () => {
      playbookExecutionEvents.off(PLAYBOOK_EXECUTION_START, onPlaybookStart);
      playbookExecutionEvents.off(PLAYBOOK_EXECUTION_STATUS, onPlaybookStatus);
      playbookExecutionEvents.off(PLAYBOOK_EXECUTION_END, onPlaybookEnd);
      playbookExecutionEvents.off(
        'playbook:execution:notification',
        onNotification,
      );
      playbookExecutionEvents.off(
        'playbook:execution:smart-failure',
        onSmartFailure,
      );
      delete (window as any).playbookHandler;
    };
  }, []);

  // Debug: log executionFinished and status on each render
  console.log('Playbook Widget Render:', { executionFinished, status });

  // Poll for updates when executing and not finished
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isExecuting && !executionFinished && execId) {
      intervalId = setInterval(() => {
        if (window.playbookHandler) {
          window.playbookHandler.pollingCallback(execId);
        }
      }, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isExecuting, executionFinished, execId]);

  const handleWidgetClick = () => {
    setIsModalOpen(true);
    // If execution is finished, hide the widget (set both isExecuting and executionFinished to false)
    if (executionFinished) {
      setIsExecuting(false);
      setExecutionFinished(false);
    }
  };

  // Ensure the modal is only closed by user action (OK/Cancel in modal), never by playbook end events.
  // Do NOT set isModalOpen to false in any event or effect except via setIsModalOpen from modal actions.

  // Helper to determine status
  const isSuccess =
    PlaybookExecutionHandler.isFinalStatus(status) &&
    status === SsmAnsible.AnsibleTaskStatus.SUCCESS;
  const isFailure =
    PlaybookExecutionHandler.isFinalStatus(status) &&
    status !== SsmAnsible.AnsibleTaskStatus.SUCCESS;
  const isInProgress = !PlaybookExecutionHandler.isFinalStatus(status);

  return (
    <>
      {(isExecuting || isSuccess || isFailure) && (
        <Popover
          content={
            <div style={{ minWidth: 180 }}>
              {displayName ? (
                <span>
                  Executing: <b>{displayName}</b>
                </span>
              ) : (
                <span>No playbook executing</span>
              )}
            </div>
          }
          trigger="hover"
        >
          <div className={styles['status-badge']} onClick={handleWidgetClick}>
            <div className={styles['playbook-execution-indicator']}>
              {/* Orange, pulsating for in progress */}
              {isInProgress && (
                <>
                  <div
                    className={styles['inner-circle']}
                    style={{ background: '#faad14' }}
                  />
                  <div
                    className={`${styles['pulse-ring']} ${styles['pulsating']}`}
                    style={{ backgroundColor: '#faad14' }}
                  />
                </>
              )}
              {/* Green for success */}
              {isSuccess && (
                <div
                  className={styles['inner-circle']}
                  style={{ background: '#52c41a' }}
                />
              )}
              {/* Red for failure */}
              {isFailure && (
                <div
                  className={styles['inner-circle']}
                  style={{ background: '#ff4d4f' }}
                />
              )}
            </div>
            <span className={styles['status-label']}>
              {isInProgress && 'Executing'}
              {isSuccess && 'Success'}
              {isFailure && 'Failed'}
            </span>
          </div>
        </Popover>
      )}
      {isModalOpen && (
        <PlaybookExecutionTerminalModal
          ref={terminalModalRef}
          execId={execId}
          startTerminal={() => {
            if (!executionFinished) {
              playbookExecutionEvents.emit(PLAYBOOK_EXECUTION_START, {
                execId,
                displayName,
              });
            }
            return Promise.resolve();
          }}
          isOpen={isModalOpen}
          displayName={displayName}
          setIsOpen={setIsModalOpen}
          isPollingEnabled={isExecuting && !executionFinished}
          setIsPollingEnabled={setIsExecuting}
        />
      )}
    </>
  );
};

declare global {
  interface Window {
    playbookHandler: PlaybookExecutionHandler;
  }
}

export default PlaybookExecutionWidget;

import { Live24Filled } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { sshSocket as socket } from '@/socket';
import { useParams } from '@@/exports';
import { PageContainer } from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import React, { RefObject, useEffect } from 'react';
import { SsmEvents } from 'ssm-shared-lib';

// Extracting constants for better readability
const ROW_HEIGHT = 16;
const COL_WIDTH = 8;
const rows = Math.ceil(document.body.clientHeight / ROW_HEIGHT);
const cols = Math.ceil(document.body.clientWidth / COL_WIDTH);

const DeviceSSHTerminal = () => {
  const { id } = useParams();
  const terminalRef: RefObject<TerminalCoreHandles> =
    React.createRef<TerminalCoreHandles>();

  const handleDataOut = (value: string) => {
    console.log('Sending data to SSH:' + value);
    socket.emit(SsmEvents.SSH.NEW_DATA, value);
  };

  const handleResize = (newRows: number, newCols: number) => {
    console.log('Resizing SSH terminal to:', { cols: newCols, rows: newRows });
    socket.emit(SsmEvents.SSH.SCREEN_RESIZE, { cols: newCols, rows: newRows });
  };

  // Flag to track if we've already initiated a connection
  const connectionInitiated = React.useRef(false);

  const setupSocket = (
    onDataIn: (value: string, newLine?: boolean) => void,
  ) => {
    // Prevent multiple setup attempts
    if (connectionInitiated.current) {
      console.log('SSH connection already initiated, ignoring duplicate setup');
      return;
    }

    connectionInitiated.current = true;
    console.log('Setting up new SSH connection...');

    terminalRef?.current?.resetTerminalContent();
    socket.connect();
    terminalRef?.current?.onDataIn('---', true);
    terminalRef?.current?.onDataIn('#  ,;;:;,', true);
    terminalRef?.current?.onDataIn('#   ;;;;;', true);
    terminalRef?.current?.onDataIn("#  ,:;;:;    ,'=.", true);
    terminalRef?.current?.onDataIn("#  ;:;:;' .=\" ,'_\\", true);
    terminalRef?.current?.onDataIn("#  ':;:;,/  ,__:=@", true);
    terminalRef?.current?.onDataIn("#   ';;:;  =./)_", true);
    terminalRef?.current?.onDataIn('#     `"=\\_  )_"`', true);
    terminalRef?.current?.onDataIn('#          ``\'"`', true);
    terminalRef?.current?.onDataIn(
      '# Squirrel Servers Manager Remote SSH Terminal',
      true,
    );
    terminalRef?.current?.onDataIn('---', true);
    onDataIn('🛜 Connecting...', true);

    // Remove any existing listeners to prevent duplicates
    socket.off(SsmEvents.SSH.NEW_DATA);
    socket.off(SsmEvents.SSH.STATUS);

    // Set up event listeners first
    socket.on(SsmEvents.SSH.NEW_DATA, (value: string, newLine?: boolean) => {
      onDataIn(value, newLine);
      console.log('Received data from SSH:', value);
    });
    socket.on(SsmEvents.SSH.STATUS, (value) => {
      void message.info({
        content: `${value.status} - ${value.message}`,
        duration: 6,
      });
      if (value.status !== 'OK') {
        onDataIn(`${value.status} - ${value.message}`);
      }
    });

    console.log('Connecting to SSH with device ID:', id);
    socket
      .emitWithAck(SsmEvents.SSH.START_SESSION, { deviceUuid: id, rows, cols })
      .then((response) => {
        if (!response.success) {
          void message.error({
            content: `Socket failed to connect: ${response.message}`,
            duration: 6,
          });
          connectionInitiated.current = false;
        } else {
          console.log(
            'SSH connection successful with session ID:',
            response.sessionId,
          );
        }
      })
      .catch((error) => {
        connectionInitiated.current = false;
        void message.error({
          content: `Socket failed to connect ${error.message}`,
          duration: 6,
        });
      });
  };

  const cleanupSocket = (
    onDataIn: (value: string, newLine?: boolean) => void,
  ) => {
    console.log('Cleaning up SSH connection...');
    socket.emit(SsmEvents.SSH.CLOSED);
    socket.off(SsmEvents.SSH.NEW_DATA, onDataIn);
    socket.off(SsmEvents.SSH.STATUS);
    socket.disconnect();
    connectionInitiated.current = false;
  };

  useEffect(() => {
    if (terminalRef.current) {
      const onDataIn = terminalRef.current.onDataIn;
      setupSocket(onDataIn);

      return () => {
        cleanupSocket(onDataIn);
      };
    }
  }, [id]);

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            icon={<Live24Filled />}
            title="SSH Terminal"
            backgroundColor={TitleColors.SETTINGS_DEVICES}
          />
        ),
      }}
      style={{ height: '100%' }}
    >
      <TerminalCore
        ref={terminalRef}
        onDataOut={handleDataOut}
        onResize={handleResize}
        cols={cols}
        rows={rows}
      />
    </PageContainer>
  );
};

export default DeviceSSHTerminal;

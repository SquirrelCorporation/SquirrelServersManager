import { Live24Filled } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { sshSocket as socket } from '@/socket';
import { useParams } from '@@/exports';
import { PageContainer } from '@ant-design/pro-components';
import { message } from 'antd';
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
    socket.emit(SsmEvents.SSH.NEW_DATA, value);
  };

  const handleResize = (newRows: number, newCols: number) => {
    socket.emit(SsmEvents.SSH.SCREEN_RESIZE, { cols: newCols, rows: newRows });
  };

  const setupSocket = (
    onDataIn: (value: string, newLine?: boolean) => void,
  ) => {
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
    socket
      .emitWithAck(SsmEvents.SSH.START_SESSION, { deviceUuid: id, rows, cols })
      .then((response) => {
        if (response.status !== 'OK') {
          void message.error({
            content: `Socket failed to connect (${response.status} - ${response.error})`,
            duration: 6,
          });
        } else {
          socket.on(SsmEvents.SSH.NEW_DATA, onDataIn);
          socket.on(SsmEvents.SSH.STATUS, (value) => {
            void message.info({
              content: `${value.status} - ${value.message}`,
              duration: 6,
            });
            if (value.status !== 'OK') {
              onDataIn(`${value.status} - ${value.message}`);
            }
          });
        }
      })
      .catch((error) => {
        void message.error({
          content: `Socket failed to connect ${error.message}`,
          duration: 6,
        });
      });
  };

  const cleanupSocket = (
    onDataIn: (value: string, newLine?: boolean) => void,
  ) => {
    socket.emit(SsmEvents.SSH.CLOSED);
    socket.off(SsmEvents.SSH.NEW_DATA, onDataIn);
    socket.disconnect();
  };

  useEffect(() => {
    if (terminalRef.current) {
      const onDataIn = terminalRef.current.onDataIn;
      setupSocket(onDataIn);

      return () => {
        cleanupSocket(onDataIn);
      };
    }
  }, [id, terminalRef.current]);

  return (
    <PageContainer
      header={{
        title: (
          <Title
            icon={<Live24Filled />}
            title="SSH Terminal"
            color={TitleColors.BLUE}
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

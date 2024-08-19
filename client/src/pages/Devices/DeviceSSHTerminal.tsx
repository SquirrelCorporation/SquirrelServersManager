import { Live24Filled } from '@/components/Icons/CustomIcons';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { socket } from '@/socket';
import { useParams } from '@@/exports';
import { PageContainer } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { RefObject, useEffect } from 'react';

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
    socket.emit('ssh:data', value);
  };

  const handleResize = (newRows: number, newCols: number) => {
    socket.emit('ssh:resize', { cols: newCols, rows: newRows });
  };

  const setupSocket = (
    onDataIn: (value: string, newLine?: boolean) => void,
  ) => {
    socket.connect();
    onDataIn('Connecting...', true);
    socket
      .emitWithAck('ssh:start', { deviceUuid: id, rows, cols })
      .then((response) => {
        if (response.status !== 'OK') {
          void message.error({
            content: `Socket failed to connect (${response.status} - ${response.error})`,
            duration: 6,
          });
        } else {
          socket.on('ssh:data', onDataIn);
          socket.on('ssh:status', (value) => {
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
    socket.emit('logs:closing');
    socket.off('ssh:data', onDataIn);
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
      title={
        <Title.MainTitle
          backgroundColor={PageContainerTitleColors.CONTAINER_LOGS}
          title={'SSH'}
          icon={<Live24Filled />}
        />
      }
    >
      <TerminalCore
        onDataOut={handleDataOut}
        cols={cols}
        rows={rows}
        ref={terminalRef}
        onResize={handleResize}
      />
    </PageContainer>
  );
};

export default DeviceSSHTerminal;

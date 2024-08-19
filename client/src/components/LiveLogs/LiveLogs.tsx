import React, { useImperativeHandle, useEffect, useRef } from 'react';
import { message } from 'antd';
import { useParams } from '@@/exports';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { socket } from '@/socket';

export interface LiveLogsHandles {
  handleStop: () => void;
  resetTerminalContent: () => void;
}

export interface LiveLogsProps {
  from: number;
}

const ROWS = Math.ceil(document.body.clientHeight / 16);
const COLS = Math.ceil(document.body.clientWidth / 8);

const LiveLogs = React.forwardRef<LiveLogsHandles, LiveLogsProps>(
  ({ from }, ref) => {
    const { id } = useParams();
    const terminalRef = useRef<TerminalCoreHandles>(null);

    const onNewLogs = (value: any) => {
      if (value) {
        terminalRef.current?.onDataIn(value.data);
      }
    };

    const handleStop = () => {
      socket.off('logs:newLogs', onNewLogs);
      socket.disconnect();
    };

    const resetTerminalContent = () => {
      terminalRef.current?.resetTerminalContent();
    };

    const handleConnectionError = (errorMessage: string) => {
      void message.error({
        content: `Socket failed to connect ${errorMessage}`,
        duration: 6,
      });
    };

    const startSocketConnection = () => {
      socket.connect();
      resetTerminalContent();
      socket
        .emitWithAck('logs:getLogs', { containerId: id, from })
        .then((response) => {
          if (response.status === 'OK') {
            socket.on('logs:newLogs', onNewLogs);
          } else {
            handleConnectionError(`(${response.status} - ${response.error})`);
          }
        })
        .catch((e) => handleConnectionError(e.message));
    };

    useImperativeHandle(ref, () => ({ handleStop, resetTerminalContent }));

    useEffect(() => {
      startSocketConnection();
      return () => {
        socket.emit('logs:closing');
        socket.off('logs:newLogs', onNewLogs);
        socket.disconnect();
      };
    }, [from, id]);

    return (
      <div style={{ height: '800px', marginTop: 10 }}>
        <TerminalCore
          rows={ROWS}
          cols={COLS}
          ref={terminalRef}
          disableStdin={true}
          convertEol={true}
        />
      </div>
    );
  },
);

export default LiveLogs;

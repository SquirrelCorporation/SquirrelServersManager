import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { socket } from '@/socket';
import { useParams } from '@@/exports';
import { LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import React, {
  RefObject,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export interface LiveLogsHandles {
  handleStop: () => void;
  resetTerminalContent: () => void;
}

export interface LiveLogsProps {
  from: number;
}

const LiveLogs = React.forwardRef<LiveLogsHandles, LiveLogsProps>(
  ({ from }, ref) => {
    const rows = Math.ceil(document.body.clientHeight / 16);
    const cols = Math.ceil(document.body.clientWidth / 8);
    const { id } = useParams();
    const terminalRef: RefObject<TerminalCoreHandles> =
      React.createRef<TerminalCoreHandles>();

    const onNewLogs = (value: any) => {
      if (value) {
        terminalRef?.current?.onDataIn(value.data);
      }
    };

    const handleStop = () => {
      socket.off('logs:newLogs', onNewLogs);
      socket.disconnect();
    };

    const resetTerminalContent = () => {
      terminalRef?.current?.resetTerminalContent();
    };

    useImperativeHandle(ref, () => ({
      handleStop,
      resetTerminalContent,
    }));

    useEffect(() => {
      socket.connect();
      resetTerminalContent();
      socket
        .emitWithAck('logs:getLogs', { containerId: id, from: from })
        .then((e) => {
          if (e.status === 'OK') {
            socket.on('logs:newLogs', onNewLogs);
          } else {
            void message.error({
              content: `Socket failed to connect (${e.status} - ${e.error})`,
              duration: 6,
            });
          }
        })
        .catch((e) => {
          void message.error({
            content: `Socket failed to connect ${e.message}`,
            duration: 6,
          });
        });

      return () => {
        socket.emit('logs:closing');
        socket.off('logs:newLogs', onNewLogs);
        socket.disconnect();
      };
    }, [from, id]);

    return (
      <div style={{ height: '800px', marginTop: 10 }}>
        <TerminalCore
          rows={rows}
          cols={cols}
          ref={terminalRef}
          disableStdin={true}
          convertEol={true}
        />
      </div>
    );
  },
);

export default LiveLogs;

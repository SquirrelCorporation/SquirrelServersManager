import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { containerLiveLogsSocket as socket } from '@/socket';
import { useParams } from '@@/exports';
import { message } from 'antd';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { SsmEvents } from 'ssm-shared-lib';

export interface LiveLogsHandles {
  handleStop: () => void;
  resetTerminalContent: () => void;
}

export interface LiveLogsProps {
  from: number;
}

const ROWS = Math.ceil(document.body.clientHeight / 16);
const COLS = Math.ceil(document.body.clientWidth / 8);

interface LogData {
  data: string;
}

const LiveLogs = React.forwardRef<LiveLogsHandles, LiveLogsProps>(
  ({ from }, ref) => {
    const { id } = useParams();
    const terminalRef = useRef<TerminalCoreHandles>(null);

    const onNewLogs = (value: LogData) => {
      if (value) {
        terminalRef.current?.onDataIn(value.data);
      }
    };

    const handleStop = () => {
      socket.off(SsmEvents.Logs.NEW_LOGS, onNewLogs);
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
      console.log('GET_LOGS', { containerId: id, from });
      socket
        .emitWithAck(SsmEvents.Logs.GET_LOGS, { containerId: id, from })
        .then((response) => {
          if (response.success) {
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
                '# Squirrel Servers Manager Container Live Logs\n' +
                '---\n',
            );
            socket.on(SsmEvents.Logs.NEW_LOGS, onNewLogs);
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
        socket.emit(SsmEvents.Logs.CLOSED);
        socket.off(SsmEvents.Logs.NEW_LOGS, onNewLogs);
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

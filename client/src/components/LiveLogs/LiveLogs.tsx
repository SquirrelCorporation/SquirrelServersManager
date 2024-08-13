import { socket } from '@/socket';
import { message } from 'antd';
import React, { useEffect } from 'react';
import { ReactTerminal } from 'react-terminal';

const LiveLogs: React.FC = () => {
  useEffect(() => {
    socket.connect();

    function onNewLogs(value) {
      if (value) {
        console.log(value);
      }
    }
    socket
      .emitWithAck('logs:getLogs', { containerId: 'qsdqsd' })
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
        console.log(e);
        void message.error({
          content: 'Socket failed to connect',
          duration: 6,
        });
      });

    return () => {
      socket.emit('logs:closing');
      socket.off('logs:newLogs', onNewLogs);
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ height: '800px', marginTop: 10 }}>
      <ReactTerminal
        theme="material-dark"
        showControlBar={false}
        showControlButtons={false}
        enableInput={false}
        prompt={'$'}
      />
    </div>
  );
};

export default LiveLogs;

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

const DeviceSSHTerminal = () => {
  const { id } = useParams();
  const ref: RefObject<TerminalCoreHandles> =
    React.createRef<TerminalCoreHandles>();

  const rows = Math.ceil(document.body.clientHeight / 16);
  const cols = Math.ceil(document.body.clientWidth / 8);

  const onDataOut = (value: string) => {
    socket.emit('ssh:data', value);
  };

  const onResize = (newRows: number, newCols: number) => {
    socket.emit('ssh:resize', { cols: newCols, rows: newRows });
  };

  useEffect(() => {
    if (ref.current) {
      socket.connect();
      const onDataIn = ref.current?.onDataIn;
      ref.current?.onDataIn('Connecting...', true);
      socket
        .emitWithAck('ssh:start', {
          deviceUuid: id,
          rows: rows,
          cols: cols,
        })
        .then((e) => {
          if (e.status !== 'OK') {
            void message.error({
              content: `Socket failed to connect (${e.status} - ${e.error})`,
              duration: 6,
            });
          } else {
            socket.on('ssh:data', onDataIn);
            socket.on('ssh:status', (value) => {
              message.info({
                content: `${value.status} - ${value.message}`,
                duration: 6,
              });
              if (value.status !== 'OK') {
                onDataIn(`${value.status} - ${value.message}`);
              }
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
        socket.off('ssh:data', onDataIn);
        socket.disconnect();
      };
    }
  }, [id, ref.current]);

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
        onDataOut={onDataOut}
        cols={cols}
        rows={rows}
        ref={ref}
        onResize={onResize}
      />
    </PageContainer>
  );
};

export default DeviceSSHTerminal;

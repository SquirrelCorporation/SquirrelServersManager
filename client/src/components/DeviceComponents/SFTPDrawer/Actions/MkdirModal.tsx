import { SFTPDataNode } from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';
import { sftpSocket as socket } from '@/socket';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import React, { useImperativeHandle, useState } from 'react';
import { SsmEvents } from 'ssm-shared-lib';

type MkdirModalProps = {
  node?: SFTPDataNode;
  onSuccess: (path: string, newDirectory: string) => void;
};

export type MkdirModalHandles = {
  open: () => void;
};

const MkdirModal = React.forwardRef<MkdirModalHandles, MkdirModalProps>(
  ({ node, onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);

    const open = () => {
      setVisible(true);
    };

    const createDir = async (newDirectory: string): Promise<boolean> => {
      try {
        socket.connect(); // Ensure the socket is connected
        const response = await socket
          .timeout(5000)
          .emitWithAck(SsmEvents.SFTP.MKDIR, {
            path: newDirectory,
          }); // Wait for the response
        if (response.success) {
          message.success({
            content: 'Directory created successfully!',
            duration: 6,
          });
          return true; // Indicate success
        } else {
          throw new Error(
            `Failed to create directory: ${response.message || 'Unknown error'}`,
          );
        }
      } catch (error: any) {
        message.error({
          content: `Failed to create directory (${error.message})`,
          duration: 6,
        });
        return false; // Indicate failure
      }
    };

    const onClose = () => {
      setVisible(false);
    };

    useImperativeHandle(ref, () => ({ open }));
    return (
      <ModalForm
        title="Create Directory"
        clearOnDestroy
        open={visible}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
          onCancel: () => onClose(),
        }}
        onFinish={async (values) => {
          // Ensure proper path formatting
          const basePath = node?.key?.replace('//', '/') || '/';
          const newPath = `${basePath}/${values.path}`.replace('//', '/');

          const success = await createDir(newPath); // Wait for createDir execution
          if (success) {
            onSuccess(node?.key as string, values.path);
            onClose(); // Close the modal on success
          }
        }}
      >
        <ProFormText
          name="path"
          label="Path"
          fieldProps={{ prefix: `${node?.key?.replace('//', '/')}/` }}
        />
      </ModalForm>
    );
  },
);

export default MkdirModal;

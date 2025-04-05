import { sftpSocket as socket } from '@/socket';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { SsmEvents } from 'ssm-shared-lib';
import { SFTPDataNode } from '../SFTPDrawer';

type RenameModalProps = {
  node?: SFTPDataNode;
  onSuccess: (path: string, newName: string) => void;
};

export type RenameModalHandles = {
  open: () => void;
};

const RenameModal = React.forwardRef<RenameModalHandles, RenameModalProps>(
  ({ node, onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);

    const open = () => {
      setVisible(true);
    };

    const rename = async (newName: string): Promise<boolean> => {
      try {
        socket.connect(); // Ensure the socket is connected

        // Construct new path using parent path
        const { parentPath } = splitPath(node?.key);
        const newPath = `${parentPath}/${newName}`.replace('//', '/');

        const response = await socket
          .timeout(5000)
          .emitWithAck(SsmEvents.SFTP.RENAME, {
            oldPath: node?.key,
            newPath: newPath,
          }); // Wait for the response
        if (response.success) {
          message.success('Renamed successfully!');
          return true; // Indicate success
        } else {
          throw new Error(
            `Failed to rename: ${response.message || 'Unknown error'}`,
          );
        }
      } catch (error: any) {
        message.error({
          content: `Failed to rename (${error.message})`,
          duration: 6,
        });
        return false; // Indicate failure
      }
    };

    const onClose = () => {
      setVisible(false);
    };

    // Split path into parent path (prefix) and file/directory name
    const splitPath = (
      fullPath?: string,
    ): { parentPath?: string; baseName?: string } => {
      if (!fullPath) return {};
      const trimmedPath = fullPath.replace(/\/$/, ''); // Remove trailing slash if any
      const lastSlashIndex = trimmedPath.lastIndexOf('/'); // Find the last slash position
      if (lastSlashIndex === -1) {
        return { parentPath: '', baseName: trimmedPath }; // No parent, it's current directory
      }
      return {
        parentPath: trimmedPath.substring(0, lastSlashIndex) || '/', // Parent path (default to root if empty)
        baseName: trimmedPath.substring(lastSlashIndex + 1), // File or directory name
      };
    };
    const { parentPath, baseName } = splitPath(node?.key); // Extract parentPath and baseName

    useImperativeHandle(ref, () => ({ open }));
    return (
      <ModalForm
        title="Rename"
        clearOnDestroy
        open={visible}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
          onCancel: () => onClose(),
        }}
        onFinish={async (values) => {
          const success = await rename(values.newName); // Wait for createDir execution
          if (success) {
            onSuccess(node?.key as string, values.newName);
            onClose(); // Close the modal on success
          }
        }}
      >
        <ProFormText
          name="newName"
          label="New name"
          fieldProps={{ prefix: `${parentPath}/`.replace('//', '/') }}
          initialValue={baseName}
        />
      </ModalForm>
    );
  },
);

export default RenameModal;

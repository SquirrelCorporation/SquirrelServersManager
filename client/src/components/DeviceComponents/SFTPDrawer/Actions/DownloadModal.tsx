import { SFTPDataNode } from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';
import { socket } from '@/socket';
import { Button, message, Modal, Result, Spin } from 'antd';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { SsmEvents } from 'ssm-shared-lib';

type DownloadModalProps = {
  node?: SFTPDataNode;
};

export type DownloadModalHandles = {
  open: () => void;
};

const DownloadModal = React.forwardRef<
  DownloadModalHandles,
  DownloadModalProps
>(({ node }, ref) => {
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileSize, setFileSize] = useState<number>(0); // File size is now state
  const fileBufferRef = React.useRef<Uint8Array[]>([]); // Mutable ref for the file buffer

  /** Function to initiate file download */
  const downloadFile = async (path: string) => {
    try {
      socket.connect(); // Ensure the socket is connected
      fileBufferRef.current = [];
      socket.timeout(5000).emit(SsmEvents.SFTP.DOWNLOAD, {
        path: path.replace('//', '/'),
      });
    } catch (error: any) {
      message.error({
        content: `Failed to download file (${error.message})`,
        duration: 6,
      });
    }
  };

  /** Function to open the modal */
  const open = () => {
    setDownloading(true);
    fileBufferRef.current = []; // Clear file buffer ref before starting a new download
    setFileSize(0); // Clear file size
    setFileName(undefined);
    setVisible(true);
  };

  /** Function to close the modal */
  const onClose = () => {
    fileBufferRef.current = []; // Clear file buffer ref before starting a new download
    setFileSize(0); // Clear file size
    setFileName(undefined);
    setVisible(false);
  };

  const handleComplete = (completedFilename: string) => {
    setTimeout(() => {
      setDownloading(false); // Stop spinner
    }, 1500);
    // Combine all chunks into a single Blob for download
    const blob = new Blob(fileBufferRef.current);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', completedFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the link
    window.URL.revokeObjectURL(url); // Revoke the URL
  };

  const appendChunk = (chunk: Uint8Array) => {
    console.log('[DEBUG] Appending chunk to file buffer.');
    fileBufferRef.current.push(chunk); // Append chunk directly to the mutable ref
  };

  const handleError = (error: string) => {
    message.error({
      content: `Error during file download: ${error}`,
      duration: 6,
    });
  };

  const handleNotfound = (error: string) => {
    message.error({
      content: `File not found: ${error}`,
      duration: 6,
    });
  };

  const putMetadata = ({
    size,
    filename,
  }: {
    size: number;
    filename: string;
  }) => {
    setFileSize(size);
    setFileName(filename);
  };
  /** Bind socket events when the component mounts */
  useEffect(() => {
    socket.removeAllListeners(SsmEvents.FileTransfer.CHUNK);
    socket.removeAllListeners(SsmEvents.FileTransfer.METADATA);
    socket.removeAllListeners(SsmEvents.FileTransfer.COMPLETE);
    socket.removeAllListeners(SsmEvents.FileTransfer.ERROR);
    socket.removeAllListeners(SsmEvents.FileTransfer.NOT_FOUND);

    // Handle file not found
    socket.on(SsmEvents.FileTransfer.NOT_FOUND, handleNotfound);

    // Handle file metadata
    socket.on(SsmEvents.FileTransfer.METADATA, putMetadata);

    // Handle file chunks
    socket.on(SsmEvents.FileTransfer.CHUNK, appendChunk);

    // Handle file download completion
    socket.on(SsmEvents.FileTransfer.COMPLETE, handleComplete);

    // Handle errors during file download
    socket.on(SsmEvents.FileTransfer.ERROR, handleError);
    return () => {
      console.log('[DEBUG] Cleaning up socket listeners.');
      socket.off(SsmEvents.FileTransfer.COMPLETE, handleComplete);
      socket.off(SsmEvents.FileTransfer.ERROR, handleError);
      socket.off(SsmEvents.FileTransfer.NOT_FOUND, handleNotfound);
      socket.off(SsmEvents.FileTransfer.METADATA, putMetadata);
      socket.off(SsmEvents.FileTransfer.CHUNK, appendChunk);
    };
  }, []);

  useEffect(() => {
    if (visible && node?.key) {
      void downloadFile(node.key);
    }
  }, [visible, node?.key]);

  /** Expose open function to parent components using `ref` */
  useImperativeHandle(ref, () => ({ open }));

  /** Render the modal */
  return (
    <Modal
      title="Download File"
      open={visible}
      onCancel={onClose}
      destroyOnClose
      key={visible ? 'modal-visible' : 'modal-hidden'}
      footer={[
        <Button
          key="submit"
          type="primary"
          loading={downloading}
          onClick={onClose}
        >
          Close
        </Button>,
      ]}
    >
      {(downloading && (
        <Spin tip="Downloading..." size="large">
          <div
            style={{
              padding: 50,
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 4,
            }}
          />
        </Spin>
      )) || (
        <Result status="success" title={`File "${fileName}" Downloaded!`} />
      )}
    </Modal>
  );
});

export default DownloadModal;

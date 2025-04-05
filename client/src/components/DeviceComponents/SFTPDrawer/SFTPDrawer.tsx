import DownloadModal, {
  DownloadModalHandles,
} from '@/components/DeviceComponents/SFTPDrawer/Actions/DownloadModal';
import MkdirModal, {
  MkdirModalHandles,
} from '@/components/DeviceComponents/SFTPDrawer/Actions/MkdirModal';
import RenameModal, {
  RenameModalHandles,
} from '@/components/DeviceComponents/SFTPDrawer/Actions/RenameModal';
import UpdateModeModal, {
  UpdateModeModalHandles,
} from '@/components/DeviceComponents/SFTPDrawer/Actions/UpdateModeModal';
import SFTPDropdownMenu, {
  SFTPAction,
} from '@/components/DeviceComponents/SFTPDrawer/SFTPDropdownMenu';
import { Restart } from '@/components/Icons/CustomIcons';
import { sftpSocket as socket } from '@/socket';
import {
  Button,
  Col,
  Drawer,
  message,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tree,
} from 'antd';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { API, SsmEvents } from 'ssm-shared-lib';
import { updateNodeKeyAndTitle, updateNodeMode, updateTreeData } from './utils';

export interface SFTPDrawerHandles {
  showDrawer: () => void;
}

type SFTPDrawerProps = {
  device: API.DeviceItem;
};

export interface SFTPDataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: SFTPDataNode[];
  mode?: number;
}

const SFTPDrawer = React.forwardRef<SFTPDrawerHandles, SFTPDrawerProps>(
  ({ device }, ref) => {
    const [open, setOpen] = useState(false);
    const [treeData, setTreeData] = useState<SFTPDataNode[]>([
      { title: '/', key: '/' },
    ]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<SFTPDataNode>();
    const mkdirModalRef = React.useRef<MkdirModalHandles>(null);
    const renameModalRef = React.useRef<RenameModalHandles>(null);
    const updateModeModalRef = React.useRef<UpdateModeModalHandles>(null);
    const downloadModalRef = React.useRef<DownloadModalHandles>(null);
    const [showConfirmation, setShowConfirmation] = React.useState({
      visible: false,
      onConfirm: () => {},
    });
    const showDrawer = () => {
      setOpen(true);
    };

    useImperativeHandle(ref, () => ({
      showDrawer,
    }));

    const onSuccessMkdir = (path: string, newDirectory: string) => {
      const newDirKey = `${path}/${newDirectory}`; // Key for the new directory

      // Append the new directory to the treeData
      setTreeData((prevTreeData) =>
        updateTreeData(prevTreeData, path, [
          { title: newDirectory, key: newDirKey, isLeaf: false }, // Define the new directory node
        ]),
      );
    };

    const onSuccessRename = (
      fullPathWithName: string,
      newName: string,
    ): void => {
      const pathParts = fullPathWithName.split('/');
      const newPath = [...pathParts.slice(0, -1), newName].join('/'); // Construct new full path
      const newTitle = newName; // The title is based on the newName
      console.log('onSuccessRename', fullPathWithName, newPath, newTitle);
      // Update the tree
      setTreeData((prevTreeData) =>
        updateNodeKeyAndTitle(
          prevTreeData,
          fullPathWithName,
          newPath,
          newTitle,
        ),
      );
      console.log('updatedTreeData', treeData);
    };

    const onSuccessUpdateMode = (
      fullPathWithName: string,
      newMode: number,
    ): void => {
      // Update the treeData
      setTreeData((prevTreeData) =>
        updateNodeMode(prevTreeData, fullPathWithName, newMode),
      );
    };

    const onSuccessDelete = (pathToDelete: string): void => {
      console.log('onSuccessDelete, pathToDelete:', pathToDelete);
      setTreeData((prevTreeData) =>
        updateTreeData(prevTreeData, pathToDelete, undefined, true),
      );
    };

    const onLoadData = ({ key }: any) =>
      new Promise<void>((resolve, reject) => {
        const path: string = key; // Use the key as the path to load
        // Listener to handle the response
        const handleReadDir = (data: {
          status: string;
          path: string;
          list: API.SFTPContent[];
          message?: string;
        }) => {
          if (data?.status !== 'OK') {
            void message.error({
              content: `SFTP: (${data.status} - ${data.message})`,
              duration: 6,
            });
            setTreeData((origin) => updateTreeData(origin, key, []));
            resolve();
            return;
          }
          if (data.path === path) {
            const children = data.list.map(
              (file) =>
                ({
                  title: file.filename, // Use filename as the node title
                  key: `${path}/${file.filename}`, // Use a unique key for each file
                  isLeaf: !file.isDir && !file.isSymbolicLink, // Mark as a leaf node if it's a file
                  children: file.isDir || file.isSymbolicLink ? undefined : [], // Directories get no `children` initially
                  mode: file.mode,
                }) as SFTPDataNode,
            );

            // Update the tree with the newly loaded data
            setTreeData((origin) => updateTreeData(origin, key, children));

            socket.off(SsmEvents.SFTP.READ_DIR, handleReadDir); // Clean up the event listener
            resolve(); // Resolve the promise
          }
        };
        socket.connect();
        // Add a listener for the READ_DIR event
        socket.on(SsmEvents.SFTP.READ_DIR, handleReadDir);
        // Emit the READ_DIR event
        socket.emit(SsmEvents.SFTP.READ_DIR, { path });
        // Timeout to handle cases where the response is not received
        setTimeout(() => {
          socket.off(SsmEvents.SFTP.READ_DIR, handleReadDir); // Clean up the event listener on timeout
          reject(new Error('Failed to load data.'));
        }, 5000); // Timeout after 5 seconds
      });

    const handleStatus = async (value: { status: string; message: string }) => {
      void message.info({
        content: `${value.status} - ${value.message}`,
        duration: 6,
      });
      if (value.status === 'OK') {
        try {
          await onLoadData({ key: '/' });
        } catch (error: any) {
          message.error({ content: error.message, duration: 8 });
        }
      } else {
        void message.error({
          content: `${value.status} - ${value.message}`,
          duration: 6,
        });
      }
    };

    const startSFTPSession = () => {
      console.log('Starting SFTP session, connecting socket...');
      socket.connect(); // Ensure the socket is connected

      // Add connection event listeners for debugging
      socket.on('connect', () => {
        console.log('SFTP socket connected successfully!');
        console.log('Socket ID:', socket.id);
        console.log('Socket namespace:', socket.nsp);
      });

      socket.on('connect_error', (error) => {
        console.error('SFTP socket connection error:', error);
      });

      socket.removeAllListeners(SsmEvents.SFTP.STATUS);
      socket.removeAllListeners(SsmEvents.SFTP.READ_DIR);

      setTreeData([{ title: '/', key: '/' }]);
      console.log(
        'Emitting START_SESSION event with device UUID:',
        device.uuid,
      );
      socket
        .emitWithAck(SsmEvents.SFTP.START_SESSION, {
          deviceUuid: device.uuid,
        })
        .then((response) => {
          console.log('Received START_SESSION response:', response);
          if (!response.success) {
            void message.error({
              content: `Socket failed to connect (${response.status} - ${response.error})`,
              duration: 6,
            });
          } else {
            setLoading(false);
            socket.on(SsmEvents.SFTP.STATUS, handleStatus);
            // Clean up the listener on unmount
            return () => {
              socket.off(SsmEvents.SFTP.STATUS, handleStatus);
            };
          }
        })
        .catch((error) => {
          console.error('Error in START_SESSION emitWithAck:', error);
          void message.error({
            content: `Socket failed to connect: ${error.message}`,
            duration: 6,
          });
        });
    };

    const reconnect = () => {
      // Perform reconnection logic
      if (open && device) {
        socket.disconnect(); // Ensure any existing connection is reset
        setTreeData([{ title: '/', key: '/' }]);
        setLoading(true);
        startSFTPSession(); // Restart the session
      }
    };

    useEffect(() => {
      if (open && device) {
        setLoading(true);
        startSFTPSession();

        // Clean up on component unmount or when closing the drawer
        return () => {
          socket.disconnect();
        };
      }
    }, [open, device]);

    const onClose = () => {
      setOpen(false);
      socket.off(SsmEvents.SFTP.STATUS, handleStatus);
      socket.disconnect(); // Disconnect socket when closing the drawer
    };

    const onClick = ({
      key,
      domEvent,
      node,
    }: {
      key: string;
      domEvent:
        | React.MouseEvent<HTMLElement, MouseEvent>
        | React.KeyboardEvent<HTMLElement>;
      node: SFTPDataNode;
    }) => {
      switch (key as SFTPAction) {
        case SFTPAction.MKDIR:
          mkdirModalRef?.current?.open();
          domEvent.stopPropagation();
          break;
        case SFTPAction.RENAME:
          renameModalRef?.current?.open();
          domEvent.stopPropagation();
          break;
        case SFTPAction.CHMOD:
          updateModeModalRef?.current?.open();
          domEvent.stopPropagation();
          break;
        case SFTPAction.DOWNLOAD:
          downloadModalRef?.current?.open();
          domEvent.stopPropagation();
          break;
        case SFTPAction.DELETE:
          setShowConfirmation({
            visible: true,
            onConfirm: async () => {
              const response = await socket
                .timeout(5000)
                .emitWithAck(SsmEvents.SFTP.DELETE, {
                  path: node.key,
                  isDir: !node?.isLeaf,
                });
              if (response.success) {
                message.success(
                  !node?.isLeaf ? 'Directory deleted' : 'File deleted',
                );
                if (node?.key) {
                  onSuccessDelete(node.key);
                }
              } else {
                message.error(
                  `Failed to delete: ${response.message || 'Unknown error'}`,
                );
              }
            },
          });
          domEvent.stopPropagation();
          break;
      }
    };

    return (
      <>
        <MkdirModal
          node={selectedNode}
          ref={mkdirModalRef}
          onSuccess={onSuccessMkdir}
        />
        <RenameModal
          node={selectedNode}
          ref={renameModalRef}
          onSuccess={onSuccessRename}
        />
        <UpdateModeModal
          node={selectedNode}
          ref={updateModeModalRef}
          onSuccess={onSuccessUpdateMode}
        />
        <Popconfirm
          title={`Are you sure you want to delete ${selectedNode?.title}`}
          open={showConfirmation.visible}
          onConfirm={() => {
            showConfirmation.onConfirm();
            setShowConfirmation({ visible: false, onConfirm: () => {} });
          }}
          onCancel={() =>
            setShowConfirmation({ visible: false, onConfirm: () => {} })
          }
          okText="Yes"
          cancelText="No"
        />
        <DownloadModal node={selectedNode} ref={downloadModalRef} />
        <Drawer
          title={`Browse file on ${device?.ip}`}
          width={500}
          onClose={onClose}
          open={open}
          extra={
            <Space>
              <Button type="primary" icon={<Restart />} onClick={reconnect}>
                Reconnect
              </Button>
            </Space>
          }
        >
          {(loading && (
            <Row justify="center" align="middle" style={{ height: '200px' }}>
              <Col style={{ textAlign: 'center' }}>
                {/* Ant Design's loading spinner */}
                <Spin tip="Connecting..." size="large">
                  <div
                    style={{
                      padding: 50,
                      background: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 4,
                    }}
                  />
                </Spin>
              </Col>
            </Row>
          )) || (
            <Tree.DirectoryTree
              titleRender={(item) => (
                <SFTPDropdownMenu
                  node={item}
                  onClick={onClick}
                  setSelectedNode={setSelectedNode}
                />
              )}
              loadData={onLoadData}
              treeData={treeData}
            />
          )}
        </Drawer>
      </>
    );
  },
);
export default SFTPDrawer;

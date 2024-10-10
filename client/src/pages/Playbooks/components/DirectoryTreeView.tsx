import React, { Key, useState, useEffect } from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { Button, Card, Tree, Typography } from 'antd';
import { motion } from 'framer-motion';
import GalaxyStoreModal from '@/pages/Playbooks/components/GalaxyStoreModal';
import CreateFileInRepositoryModalForm from '@/pages/Playbooks/components/CreateFileInRepositoryModalForm';
import NewFileDrawerForm from '@/pages/Playbooks/components/NewFileDrawerForm';
import PlaybookDropdownMenu from '@/pages/Playbooks/components/PlaybookDropdownMenu';
import { ClientPlaybooksTrees } from '@/pages/Playbooks/components/TreeComponent';
import { API, DirectoryTree as SSMDirectoryTree } from 'ssm-shared-lib';

const { DirectoryTree } = Tree;

export type Callbacks = {
  callbackCreateDirectory: (
    path: string,
    playbookRepositoryUuid: string,
    playbookRepositoryName: string,
    playbookRepositoryBasePath: string,
  ) => void;
  callbackCreatePlaybook: (
    path: string,
    playbookRepositoryUuid: string,
    playbookRepositoryName: string,
    playbookRepositoryBasePath: string,
  ) => void;
  callbackDeleteFile: (path: string, playbookRepositoryUuid: string) => void;
};

type DirectoryTreeViewProps = {
  onSelect: (
    selectedKeys: Key[],
    info: {
      event: 'select';
      selected: boolean;
      node: any;
      selectedNodes: any;
      nativeEvent: MouseEvent;
    },
  ) => void;
  playbookRepositories: ClientPlaybooksTrees[];
  newRepositoryFileModal: {
    opened: boolean;
    playbookRepositoryUuid: string;
    playbookRepositoryName: string;
    playbookRepositoryBasePath: string;
    path: string;
    mode: string;
  };
  setNewRepositoryFileModal: any;
  createNewFile: (
    playbooksRepositoryUuid: string,
    fileName: string,
    fullPath: string,
    mode: 'directory' | 'playbook',
  ) => Promise<boolean>;
  selectedFile?: API.PlaybookFile;
  callbacks: Callbacks;
};

const DirectoryTreeView: React.FC<DirectoryTreeViewProps> = (props) => {
  const [storeModal, setStoreModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    onSelect,
    selectedFile,
    newRepositoryFileModal,
    createNewFile,
    playbookRepositories,
    setNewRepositoryFileModal,
  } = props;

  // Define animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    // Simulate loading of DirectoryTreeView
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate={isLoaded ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.5 }}
    >
      <Card
        title="List of playbooks"
        bordered={false}
        style={{ width: '300px', minHeight: '90vh' }}
        extra={[
          <Button
            key="store"
            icon={<AppstoreOutlined />}
            onClick={() => setStoreModal(true)}
          >
            Store
          </Button>,
        ]}
      >
        <GalaxyStoreModal open={storeModal} setOpen={setStoreModal} />
        <DirectoryTree
          multiple
          onSelect={onSelect}
          treeData={playbookRepositories}
          selectedKeys={[selectedFile?.path as React.Key]}
          titleRender={(node) => {
            if (node.nodeType === SSMDirectoryTree.CONSTANTS.DIRECTORY) {
              return (
                <PlaybookDropdownMenu
                  type={SSMDirectoryTree.CONSTANTS.DIRECTORY}
                  path={
                    node.rootNode ? node.playbookRepository.basePath : node.key
                  }
                  playbookRepository={{
                    uuid: node.playbookRepository.uuid,
                    name: node.playbookRepository.name,
                    basePath: node.playbookRepository.basePath,
                  }}
                  callbacks={props.callbacks}
                  remoteRootNode={node.remoteRootNode}
                  cannotDelete={!node.custom || node.rootNode}
                >
                  <Typography.Text
                    style={{ maxWidth: 155 - 18 * node.depth }}
                    ellipsis={{ tooltip: true }}
                  >
                    {node._name}
                  </Typography.Text>
                </PlaybookDropdownMenu>
              );
            } else {
              return (
                <PlaybookDropdownMenu
                  type={SSMDirectoryTree.CONSTANTS.FILE}
                  path={node.key}
                  playbookRepository={{
                    uuid: node.playbookRepository.uuid,
                    name: node.playbookRepository.name,
                    basePath: node.playbookRepository.basePath,
                  }}
                  callbacks={props.callbacks}
                  cannotDelete={!node.custom}
                >
                  <Typography.Text
                    style={{ maxWidth: 155 - 18 * node.depth }}
                    ellipsis={{ tooltip: true }}
                  >
                    {node._name}
                  </Typography.Text>
                </PlaybookDropdownMenu>
              );
            }
          }}
        />
        <NewFileDrawerForm submitNewFile={createNewFile} />
        <CreateFileInRepositoryModalForm
          opened={newRepositoryFileModal.opened}
          // @ts-expect-error partial type
          mode={newRepositoryFileModal.mode}
          playbooksRepositoryUuid={
            newRepositoryFileModal.playbookRepositoryUuid
          }
          playbooksRepositoryName={
            newRepositoryFileModal.playbookRepositoryName
          }
          basedPath={newRepositoryFileModal.playbookRepositoryBasePath}
          setModalOpened={() =>
            setNewRepositoryFileModal({
              ...newRepositoryFileModal,
              opened: false,
            })
          }
          path={newRepositoryFileModal.path}
          submitNewFile={createNewFile}
        />
      </Card>
    </motion.div>
  );
};

export default DirectoryTreeView;

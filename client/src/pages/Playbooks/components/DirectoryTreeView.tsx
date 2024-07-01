import GalaxyStoreModal from '@/pages/Playbooks/components/GalaxyStoreModal';
import CreateFileInRepositoryModalForm from '@/pages/Playbooks/components/CreateFileInRepositoryModalForm';
import NewFileDrawerForm from '@/pages/Playbooks/components/NewFileDrawerForm';
import { ClientPlaybooksTrees } from '@/pages/Playbooks/components/TreeComponent';
import { AppstoreOutlined } from '@ant-design/icons';
import { Button, Card, Tree } from 'antd';
import React, { Key } from 'react';
import { API } from 'ssm-shared-lib';

const { DirectoryTree } = Tree;

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
};

const DirectoryTreeView: React.FC<DirectoryTreeViewProps> = (props) => {
  const [storeModal, setStoreModal] = React.useState(false);
  const [selectedPath, setSelectedPath] = React.useState('');
  const {
    onSelect,
    selectedFile,
    newRepositoryFileModal,
    createNewFile,
    playbookRepositories,
    setNewRepositoryFileModal,
  } = props;
  // @ts-ignore
  return (
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
        expandedKeys={[selectedPath as React.Key]}
      />
      <NewFileDrawerForm
        submitNewFile={createNewFile}
        setSelectedNode={setSelectedPath}
      />
      <CreateFileInRepositoryModalForm
        opened={newRepositoryFileModal.opened}
        // @ts-expect-error partial type
        mode={newRepositoryFileModal.mode}
        playbooksRepositoryUuid={newRepositoryFileModal.playbookRepositoryUuid}
        playbooksRepositoryName={newRepositoryFileModal.playbookRepositoryName}
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
  );
};

export default DirectoryTreeView;

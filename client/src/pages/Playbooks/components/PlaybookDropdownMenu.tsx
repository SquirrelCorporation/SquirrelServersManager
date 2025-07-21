import { Callbacks } from '@/pages/Playbooks/components/DirectoryTreeView';
import {
  commitAndSyncPlaybooksGitRepository,
  forcePullPlaybooksGitRepository,
} from '@/services/rest/playbooks/repositories';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  FileOutlined,
  FolderOpenOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import message from '@/components/Message/DynamicMessage';
import { Dropdown, MenuProps, Popconfirm } from 'antd';
import React from 'react';
import { DirectoryTree } from 'ssm-shared-lib';

type PlaybookDropdownMenuType = {
  path: string;
  type: DirectoryTree.CONSTANTS;
  playbookRepository: { uuid: string; name: string; basePath: string };
  children: React.ReactNode;
  callbacks: Callbacks;
  cannotDelete?: boolean;
  remoteRootNode?: boolean;
};

type PlaybookDrownMenuItemType = {
  fileType: DirectoryTree.CONSTANTS | 'any' | 'deletable';
  playbookQuickRef?: string;
  icon?: React.JSX.Element;
  label: string;
  key: string;
};

const menuItems: PlaybookDrownMenuItemType[] = [
  {
    label: 'Create new directory',
    icon: <FolderOpenOutlined />,
    key: '1',
    fileType: DirectoryTree.CONSTANTS.DIRECTORY,
  },
  {
    label: 'Create an empty playbook',
    icon: <FileOutlined />,
    key: '2',
    fileType: DirectoryTree.CONSTANTS.DIRECTORY,
  },
  {
    label: 'Delete',
    icon: <DeleteOutlined />,
    key: '3',
    fileType: 'deletable',
  },
];

const menuItemsGitRootNode: PlaybookDrownMenuItemType[] = [
  {
    label: 'Commit & Sync',
    icon: <SyncOutlined />,
    key: '4',
    fileType: 'any',
  },
  {
    label: 'Force pull',
    icon: <ArrowDownOutlined />,
    key: '5',
    fileType: 'any',
  },
];

const PlaybookDropdownMenu: React.FC<PlaybookDropdownMenuType> = ({
  children,
  callbacks,
  cannotDelete,
  playbookRepository,
  type,
  remoteRootNode,
  path,
}) => {
  const [open, setOpen] = React.useState(false);
  const items = menuItems
    .filter(
      (e) =>
        (e.fileType === 'deletable' && !cannotDelete) || e.fileType === type,
    )
    .map((e) => {
      return {
        key: e.key,
        label: e.label,
        icon: e.icon,
      };
    }) as MenuProps['items'];
  if (remoteRootNode) {
    items?.push(...menuItemsGitRootNode);
  }
  const onClick: MenuProps['onClick'] = async ({ key, domEvent }) => {
    domEvent.stopPropagation();
    switch (key) {
      case '1':
        callbacks.callbackCreateDirectory(
          path,
          playbookRepository.uuid,
          playbookRepository.name,
          playbookRepository.basePath,
        );
        break;
      case '2':
        callbacks.callbackCreatePlaybook(
          path,
          playbookRepository.uuid,
          playbookRepository.name,
          playbookRepository.basePath,
        );
        break;
      case '3':
        setOpen(true);
        break;
      case '4':
        await commitAndSyncPlaybooksGitRepository(playbookRepository.uuid).then(
          () => {
            message.info({
              content: 'Commit & sync command sent',
              duration: 6,
            });
          },
        );
        break;
      case '5':
        await forcePullPlaybooksGitRepository(playbookRepository.uuid).then(
          () => {
            message.info({ content: 'Force pull command sent', duration: 6 });
          },
        );
        break;
    }
  };

  return (
    <>
      <Popconfirm
        title="Delete the file"
        description={`Are you sure to delete ${path.split('/')[path.split('/').length - 1]}?`}
        open={open}
        onConfirm={() =>
          callbacks.callbackDeleteFile(playbookRepository.uuid, path)
        }
        onCancel={() => setOpen(false)}
        okText="Yes"
        cancelText="No"
      />
      <Dropdown menu={{ items, onClick }} trigger={['contextMenu']}>
        {children}
      </Dropdown>
    </>
  );
};
export default PlaybookDropdownMenu;

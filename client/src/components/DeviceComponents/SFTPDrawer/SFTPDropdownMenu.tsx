import { SFTPDataNode } from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';
import { Permissions } from '@/components/Icons/CustomIcons';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FolderAddOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import React from 'react';

export enum SFTPAction {
  DOWNLOAD = 'download',
  RENAME = 'rename',
  CHMOD = 'chmod',
  DELETE = 'delete',
  MKDIR = 'mkdir',
}

const fileItems: MenuProps['items'] = [
  {
    label: 'Download',
    key: SFTPAction.DOWNLOAD,
    icon: <DownloadOutlined />,
  },
  {
    label: 'Edit',
    key: 'edit',
    icon: <SettingOutlined />,
    children: [
      {
        label: 'Rename',
        key: SFTPAction.RENAME,
        icon: <EditOutlined />,
      },
      {
        label: 'CHMOD',
        key: SFTPAction.CHMOD,
        icon: <Permissions />,
      },
      {
        label: 'Delete',
        key: SFTPAction.DELETE,
        icon: <DeleteOutlined />,
      },
    ],
  },
];

const directoryItems: MenuProps['items'] = [
  ...fileItems,
  {
    label: 'Create directory',
    key: SFTPAction.MKDIR,
    icon: <FolderAddOutlined />,
  },
];

type SFTPDropdownMenuProps = {
  node: SFTPDataNode;
  onClick: ({
    key,
    domEvent,
    node,
  }: {
    key: string;
    domEvent:
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLElement>;
    node: SFTPDataNode;
  }) => void;
  setSelectedNode: React.Dispatch<
    React.SetStateAction<SFTPDataNode | undefined>
  >;
};

const SFTPDropdownMenu: React.FC<SFTPDropdownMenuProps> = ({
  node,
  onClick,
  setSelectedNode,
}) => {
  const onClickSetKey = (e: MenuInfo) => {
    setSelectedNode(node);
    onClick({ key: e.key, domEvent: e.domEvent, node: node });
  };

  return (
    <Dropdown
      menu={{
        items: node.isLeaf ? fileItems : directoryItems,
        onClick: onClickSetKey,
      }}
      trigger={['contextMenu']}
    >
      <span>{node.title}</span>
    </Dropdown>
  );
};

export default SFTPDropdownMenu;

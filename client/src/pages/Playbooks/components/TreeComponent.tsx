import {
  SimpleIconsGit,
  StreamlineLocalStorageFolderSolid,
} from '@/components/Icons/CustomIcons';
import { Typography } from 'antd';
import React, { ReactNode } from 'react';
import {
  DirectoryTree,
  API,
  Playbooks,
  DirectoryTree as DT,
} from 'ssm-shared-lib';
import PlaybookDropdownMenu from './PlaybookDropdownMenu';

export type ClientPlaybooksTrees = {
  isLeaf?: boolean;
  _name: string;
  title: ReactNode;
  children?: ClientPlaybooksTrees[];
  key: string;
  uuid?: string;
  extraVars?: API.ExtraVar[];
  custom?: boolean;
  selectable?: boolean;
};

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

export type RootNode = {};

export function buildTree(
  rootNode: API.PlaybooksRepository,
  callbacks: Callbacks,
) {
  return {
    _name: rootNode.name,
    title: (
      <PlaybookDropdownMenu
        type={DirectoryTree.CONSTANTS.DIRECTORY}
        path={rootNode.path}
        playbookRepository={{
          uuid: rootNode.uuid,
          name: rootNode.name,
          basePath: rootNode.path,
        }}
        callbacks={callbacks}
        cannotDelete={true}
      >
        <Typography.Text strong style={{ width: '100%' }}>
          {rootNode.name}
        </Typography.Text>
      </PlaybookDropdownMenu>
    ),
    key: rootNode.name,
    icon:
      rootNode.type === Playbooks.PlaybooksRepositoryType.LOCAL ? (
        <StreamlineLocalStorageFolderSolid style={{ marginTop: 5 }} />
      ) : (
        <SimpleIconsGit style={{ height: '1em', width: '1em', marginTop: 5 }} />
      ),
    selectable: false,
    children: rootNode.children
      ? recursiveTreeTransform(
          {
            ...rootNode,
            type: DT.CONSTANTS.DIRECTORY,
            path: rootNode.name,
          },
          { uuid: rootNode.uuid, name: rootNode.name, basePath: rootNode.path },
          callbacks,
        )
      : undefined,
  };
}

export function recursiveTreeTransform(
  tree: DirectoryTree.ExtendedTreeNode,
  playbookRepository: { uuid: string; name: string; basePath: string },
  callbacks: Callbacks,
  depth = 0,
): ClientPlaybooksTrees[] {
  const node = tree;
  const newTree: ClientPlaybooksTrees[] = [];
  if (node.children) {
    for (const child of node.children) {
      if (child && child.type === DirectoryTree.CONSTANTS.DIRECTORY) {
        if (depth > 20) {
          throw new Error(
            'Depth is too high, to prevent any infinite loop, directories depth is limited to 20',
          );
        }
        newTree.push({
          key: child.path,
          _name: child.name,
          title: (
            <PlaybookDropdownMenu
              type={DirectoryTree.CONSTANTS.DIRECTORY}
              path={child.path}
              playbookRepository={playbookRepository}
              callbacks={callbacks}
            >
              <Typography.Text
                style={{ maxWidth: 150 - 10 * depth }}
                ellipsis={{ tooltip: true }}
              >
                {child.name}
              </Typography.Text>
            </PlaybookDropdownMenu>
          ),
          selectable: false,
          children: recursiveTreeTransform(
            child,
            playbookRepository,
            callbacks,
            depth + 1,
          ),
        });
      } else {
        if (child) {
          newTree.push({
            key: child.path,
            _name: child.name,
            title: (
              <PlaybookDropdownMenu
                type={DirectoryTree.CONSTANTS.FILE}
                path={child.path}
                playbookRepository={playbookRepository}
                callbacks={callbacks}
                cannotDelete={!(child as DirectoryTree.ExtendedTreeNode).custom}
              >
                <Typography.Text
                  style={{ maxWidth: 150 - 10 * depth }}
                  ellipsis={{ tooltip: true }}
                >
                  {child.name}
                </Typography.Text>
              </PlaybookDropdownMenu>
            ),
            uuid: (child as DirectoryTree.ExtendedTreeNode).uuid,
            extraVars: (child as DirectoryTree.ExtendedTreeNode).extraVars,
            custom: (child as DirectoryTree.ExtendedTreeNode).custom,
            isLeaf: true,
          });
        }
      }
    }
  } else {
    newTree.push({
      key: node.path,
      _name: node.name,
      title: (
        <PlaybookDropdownMenu
          type={DirectoryTree.CONSTANTS.FILE}
          path={node.path}
          playbookRepository={playbookRepository}
          callbacks={callbacks}
          cannotDelete={!node.custom}
        >
          <Typography.Text
            style={{ maxWidth: 150 - 10 * depth }}
            ellipsis={{ tooltip: true }}
          >
            {node.name}
          </Typography.Text>
        </PlaybookDropdownMenu>
      ),
      uuid: node.uuid,
      extraVars: node.extraVars,
      custom: node.custom,
      isLeaf: true,
    });
  }
  return newTree;
}

import {
  SimpleIconsGit,
  StreamlineLocalStorageFolderSolid,
} from '@/components/Icons/CustomIcons';
import React, { ReactNode } from 'react';
import {
  API,
  DirectoryTree,
  DirectoryTree as DT,
  Playbooks,
} from 'ssm-shared-lib';

export type ClientPlaybooksTrees = {
  isLeaf?: boolean;
  _name: string;
  nodeType: DirectoryTree.CONSTANTS;
  children?: ClientPlaybooksTrees[];
  rootNode?: boolean;
  remoteRootNode?: boolean;
  playbookRepository: { uuid: string; name: string; basePath: string };
  depth: number;
  key: string;
  uuid?: string;
  extraVars?: API.ExtraVar[];
  custom?: boolean;
  selectable?: boolean;
  icon?: ReactNode;
};

export function buildTree(
  rootNode: API.PlaybooksRepository,
  onlyDirectories?: boolean,
): ClientPlaybooksTrees {
  return {
    _name: rootNode.name,
    remoteRootNode: rootNode.type === Playbooks.PlaybooksRepositoryType.GIT,
    depth: 0,
    rootNode: true,
    playbookRepository: {
      basePath: rootNode.path,
      name: rootNode.name,
      uuid: rootNode.uuid,
    },
    key: rootNode.name,
    nodeType: DT.CONSTANTS.DIRECTORY,
    icon:
      rootNode.type === Playbooks.PlaybooksRepositoryType.LOCAL ? (
        <StreamlineLocalStorageFolderSolid />
      ) : (
        <SimpleIconsGit />
      ),
    selectable: !!onlyDirectories,
    children: rootNode.children
      ? recursiveTreeTransform(
          {
            ...rootNode,
            type: DT.CONSTANTS.DIRECTORY,
            path: rootNode.name,
          },
          { uuid: rootNode.uuid, name: rootNode.name, basePath: rootNode.path },
          onlyDirectories,
        )
      : undefined,
  };
}

export function recursiveTreeTransform(
  tree: DirectoryTree.ExtendedTreeNode,
  playbookRepository: { uuid: string; name: string; basePath: string },
  onlyDirectories?: boolean,
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
          nodeType: child.type,
          rootNode: false,
          playbookRepository: {
            basePath: playbookRepository.basePath,
            name: playbookRepository.name,
            uuid: playbookRepository.uuid,
          },
          // TODO ugly fix to prevent user breaking the system
          custom:
            (child as DirectoryTree.ExtendedTreeNode).custom === undefined &&
            !child.path.includes(
              '/server/src/ansible/00000000-0000-0000-0000-000000000000/agent',
            ) &&
            !child.path.includes(
              '/server/src/ansible/00000000-0000-0000-0000-000000000000/device',
            ),
          depth: depth,
          selectable: !!onlyDirectories,
          children: recursiveTreeTransform(
            child,
            playbookRepository,
            onlyDirectories,
            depth + 1,
          ),
        });
      } else {
        if (child && !onlyDirectories) {
          console.log(
            JSON.stringify((child as DirectoryTree.ExtendedTreeNode).extraVars),
          );
          newTree.push({
            key: child.path,
            _name: child.name,
            nodeType: DirectoryTree.CONSTANTS.FILE,
            rootNode: false,
            playbookRepository: {
              basePath: playbookRepository.basePath,
              name: playbookRepository.name,
              uuid: playbookRepository.uuid,
            },
            depth: depth,
            uuid: (child as DirectoryTree.ExtendedTreeNode).uuid,
            extraVars: (child as DirectoryTree.ExtendedTreeNode).extraVars,
            custom: (child as DirectoryTree.ExtendedTreeNode).custom,
            isLeaf: true,
          });
        }
      }
    }
  } else if (!onlyDirectories) {
    console.log(
      JSON.stringify((node as DirectoryTree.ExtendedTreeNode).extraVars),
    );

    newTree.push({
      key: node.path,
      _name: node.name,
      rootNode: false,
      nodeType: DirectoryTree.CONSTANTS.FILE,
      playbookRepository: {
        basePath: playbookRepository.basePath,
        name: playbookRepository.name,
        uuid: playbookRepository.uuid,
      },
      depth: depth,
      uuid: node.uuid,
      extraVars: node.extraVars,
      custom: node.custom,
      isLeaf: true,
    });
  }
  return newTree;
}

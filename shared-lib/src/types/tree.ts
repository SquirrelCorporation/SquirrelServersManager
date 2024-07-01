export enum CONSTANTS {
  DIRECTORY = 'directory',
  FILE = 'file',
}

export type TreeNode = {
  path: string;
  name: string;
  isSymbolicLink?: boolean;
  extension?: string;
  type?: CONSTANTS.DIRECTORY | CONSTANTS.FILE;
  children?: (TreeNode | ExtendedTreeNode | null)[];
  size?: number;
};

export type ExtendedTreeNode = TreeNode & {
  uuid?: string;
  extraVars?: any;
  custom?: boolean;
};

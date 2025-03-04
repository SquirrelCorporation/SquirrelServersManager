import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DirectoryTree } from 'ssm-shared-lib';

/**
 * Options for generating a directory tree
 */
export interface DirectoryTreeOptions {
  extensions?: RegExp;
  exclude?: string[];
}

/**
 * Service for generating directory trees
 */
@Injectable()
export class RepositoryTreeService {
  private readonly logger = new Logger(RepositoryTreeService.name);

  /**
   * Generate a directory tree
   * @param rootPath The root path to generate the tree from
   * @param options Options for generating the tree
   * @returns The generated tree
   */
  generateDirectoryTree(rootPath: string, options: DirectoryTreeOptions = {}): DirectoryTree.TreeNode {
    this.logger.debug(`Generating directory tree for ${rootPath}`);
    
    if (!fs.existsSync(rootPath)) {
      this.logger.warn(`Root path ${rootPath} does not exist`);
      return {
        name: path.basename(rootPath),
        path: rootPath,
        type: DirectoryTree.CONSTANTS.DIRECTORY,
        children: [],
      };
    }

    try {
      const tree = this.buildTree(rootPath, rootPath, options);
      if (!tree) {
        this.logger.warn(`Failed to build tree for ${rootPath}`);
        return {
          name: path.basename(rootPath),
          path: rootPath,
          type: DirectoryTree.CONSTANTS.DIRECTORY,
          children: [],
        };
      }
      return tree;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating directory tree: ${errorMessage}`);
      return {
        name: path.basename(rootPath),
        path: rootPath,
        type: DirectoryTree.CONSTANTS.DIRECTORY,
        children: [],
      };
    }
  }

  /**
   * Build a directory tree
   * @param rootPath The root path to build the tree from
   * @param currentPath The current path being processed
   * @param options Options for building the tree
   * @returns The built tree node or undefined if the node should be excluded
   */
  private buildTree(rootPath: string, currentPath: string, options: DirectoryTreeOptions): DirectoryTree.TreeNode | undefined {
    const name = path.basename(currentPath);
    
    // Check if the path should be excluded
    if (options.exclude && options.exclude.includes(name)) {
      return undefined;
    }
    
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const children: DirectoryTree.TreeNode[] = [];
      
      try {
        const files = fs.readdirSync(currentPath);
        
        for (const file of files) {
          const filePath = path.join(currentPath, file);
          const node = this.buildTree(rootPath, filePath, options);
          
          if (node) {
            children.push(node);
          }
        }
        
        return {
          name,
          path: currentPath,
          type: DirectoryTree.CONSTANTS.DIRECTORY,
          children,
        };
      } catch (error) {
        this.logger.error(`Error reading directory ${currentPath}: ${error}`);
        return {
          name,
          path: currentPath,
          type: DirectoryTree.CONSTANTS.DIRECTORY,
          children: [],
        };
      }
    } else if (stats.isFile()) {
      // Check if the file matches the extension filter
      if (options.extensions && !options.extensions.test(name)) {
        return undefined;
      }
      
      return {
        name,
        path: currentPath,
        type: DirectoryTree.CONSTANTS.FILE,
      };
    }
    
    return undefined;
  }

  /**
   * Recursively flatten a directory tree
   * @param tree The tree to flatten
   * @returns The flattened tree
   */
  recursivelyFlattenTree(tree: DirectoryTree.TreeNode): DirectoryTree.TreeNode[] {
    const result = this.recursivelyFlattenTreeInternal(tree);
    return result.filter(node => node !== undefined) as DirectoryTree.TreeNode[];
  }

  /**
   * Internal method to recursively flatten a directory tree
   * @param tree The tree to flatten
   * @param depth The current depth in the tree
   * @returns The flattened tree
   */
  private recursivelyFlattenTreeInternal(
    tree: DirectoryTree.TreeNode,
    depth = 0,
  ): (DirectoryTree.TreeNode | undefined)[] {
    if (!tree) {
      return [];
    }
    
    const result: (DirectoryTree.TreeNode | undefined)[] = [tree];
    
    if (tree.children && tree.children.length > 0) {
      for (const child of tree.children) {
        if (child) {
          result.push(...this.recursivelyFlattenTreeInternal(child, depth + 1));
        }
      }
    }
    
    return result;
  }
} 
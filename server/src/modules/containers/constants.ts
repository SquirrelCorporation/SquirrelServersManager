/**
 * Constants for container watchers and registries
 */

import os from 'node:os';
import { SSM_DATA_PATH } from 'src/config';

export const WATCHERS = {
  DOCKER: 'docker',
  PROXMOX: 'proxmox',
};

export const REGISTRIES = {
  HUB: 'hub',
  CUSTOM: 'custom',
  GCR: 'gcr',
  GHCR: 'ghcr',
  QUAY: 'quay',
  ECR: 'ecr',
  GITEA: 'gitea',
  FORGEJO: 'forgejo',
  LSCR: 'lscr',
  GITLAB: 'gitlab',
  ACR: 'acr',
};

export const FILESYSTEM_BACKUP_PATH = SSM_DATA_PATH + '/backup/volumes/';
export const BROWSER_BACKUP_PATH = os.tmpdir() + '/';

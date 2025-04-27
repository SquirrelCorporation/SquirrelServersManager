/**
 * Constants for the playbooks module
 */
import { SSM_DATA_PATH } from '../../config';

// Document and collection names for MongoDB
export const PLAYBOOKS_REPOSITORY_DOCUMENT = 'PlaybooksRepository';
export const PLAYBOOKS_REPOSITORY_COLLECTION = 'playbooksrepository';
export const DIRECTORY_ROOT = `${SSM_DATA_PATH}/playbooks`;
export const FILE_PATTERN = /\.yml$/;

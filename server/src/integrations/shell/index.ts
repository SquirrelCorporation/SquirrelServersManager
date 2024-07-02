import * as AnsibleShell from './ansible';
import * as AuthenticationShell from './managers/SshPrivateKeyFileManager';
import PlaybookFileManager from './managers/PlaybookFileManager';
import FileSystemManager from './managers/FileSystemManager';
import SshPrivateKeyFileManager from './managers/SshPrivateKeyFileManager';

export default {
  AnsibleShell,
  AuthenticationShell,
  PlaybookFileManager,
  FileSystemManager,
  SshPrivateKeyFileManager,
};

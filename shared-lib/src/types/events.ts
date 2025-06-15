export enum Logs {
  GET_LOGS = 'logs:getLogs',
  NEW_LOGS = 'logs:newLogs',
  CLOSED = 'logs:closed'
}

export enum SSH {
  START_SESSION = 'ssh:start',
  NEW_DATA = 'ssh:data',
  STATUS = 'ssh:status',
  SCREEN_RESIZE = 'ssh:resize',
  CLOSED = 'ssh:closed',
}

export enum SFTP {
  START_SESSION = 'sftp:start',
  READ_DIR = 'sftp:readDir',
  MKDIR = 'sftp:mkdir',
  RENAME = 'sftp:rename',
  CHMOD = 'sftp:chmod',
  DELETE = 'sftp:delete',
  UPLOAD = 'sftp:upload',
  DOWNLOAD = 'sftp:download',
  STATUS = 'sftp:status',
  CLOSED = 'sftp:closed',
}

export enum FileTransfer {
  REQUEST = 'file:start',
  METADATA = 'file:metadata',
  CHUNK = 'file:chunk',
  COMPLETE = 'file:complete',
  PROGRESS = 'file:progress',
  ERROR = 'file:error',
  NOT_FOUND = 'file:notFound',
}

export enum Update {
  CONTAINER_CHANGE = 'container:change',
  NOTIFICATION_CHANGE = 'notification:change',
  DEVICE_CHANGE = 'device:change'
}

export enum Common {
  DISCONNECT = 'disconnect',
  ERROR = 'error'
}

export enum Alert {
  NEW_ALERT = 'alert:new',
}

export enum VolumeBackup {
  PROGRESS = 'volume:backup:progress',
}

export enum Diagnostic {
  PROGRESS = 'diagnostic:progress'
}

export enum RemoteSystemInfoDebug {
  DEBUG_COMPONENT = 'rsi-debug:component',
  DEBUG_COMMAND = 'rsi-debug:command',
  DEBUG_ERROR = 'rsi-debug:error'
}

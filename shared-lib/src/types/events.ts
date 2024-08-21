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

export enum Common {
  DISCONNECT = 'disconnect',
  ERROR = 'error'
}

export enum ContainerTypes {
  DOCKER = 'docker',
  PROXMOX = 'proxmox',
  LXC = 'lxc',
}

export enum Actions {
  PAUSE = 'pause',
  START = 'start',
  RESTART = 'restart',
  KILL = 'kill',
  STOP = 'stop'
}

export enum VolumeActions {
  BACKUP = 'backup'
}

export enum VolumeBackupMode {
  FILE_SYSTEM = 'filesystem',
  BROWSER = 'browser',
}

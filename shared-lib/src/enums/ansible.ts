export enum SSMReservedExtraVars {
  MASTER_NODE_URL = '_ssm_masterNodeUrl',
  DEVICE_ID = '_ssm_deviceId',
}

export enum SSHType {
  UserPassword = 'userPwd',
  KeyBased = 'keyBased',
}

export enum AnsibleBecomeMethod {
  SUDO = 'sudo',
  SU = 'su',
  PBRUN = 'pbrun',
  PFEXEC = 'pfexec',
  DOAS = 'doas',
  DZDO = 'dzdo',
  KSU = 'ksu',
  RUNAS = 'runas',
  MACHINECTL = 'machinectl',
}

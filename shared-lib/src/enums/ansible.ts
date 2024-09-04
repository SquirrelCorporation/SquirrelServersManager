export enum ExtraVarsType {
  CONTEXT = 'CONTEXT', // Depends on execution context
  SHARED = 'SHARED', // Pulled from cache injected automatically when defined in JSON, shared across playbooks
  MANUAL = 'MANUAL', // Defined manually at the execution of the playbook,
}

export enum DefaultContextExtraVarsList {
  DEVICE_ID = '_ssm_deviceId',
  DEVICE_IP = '_ssm_deviceIP',
  AGENT_LOG_PATH = '_ssm_agentLogPath',
}

export enum DefaultSharedExtraVarsList {
  MASTER_NODE_URL = '_ssm_masterNodeUrl'
}

export enum SSHType {
  UserPassword = 'userPwd',
  KeyBased = 'keyBased',
}

export enum SSHConnection {
  BUILTIN = 'ssh',
  PARAMIKO = 'paramiko',
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

export enum ExecutionMode {
  APPLY = "apply",
  CHECK = 'check',
  CHECK_AND_DIFF = 'check-diff'
}

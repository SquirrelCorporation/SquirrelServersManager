import { ExtraVarsType, SSHConnection, SSHType } from '../enums/ansible';
import { ContainerTypes, VolumeBackupMode } from '../enums/container';
import { Services } from '../enums/git';
import * as SsmProxmox from '../enums/proxmox';
import { RepositoryType } from '../enums/repositories';
import { AutomationChain } from '../form/automation';
import { ProxmoxModel } from '../namespace/proxmox';
import { Systeminformation } from '../namespace/system-information';
import { ExtendedTreeNode } from './tree';

export type Response<T> = {
  success: boolean;
  message: string;
  data: T
};

export type HasUsers = {
  success?: boolean;
  data?: { hasUsers?: boolean };
};

export type SimpleResult = {
  success?: boolean;
};

export type UserSystemPerformance = {
  danger?: boolean;
  message?: string;
};

export type CurrentUser = {
  name?: string;
  avatar?: string;
  email?: string;
  access?: string;
  systemPerformance: UserSystemPerformance;
  devices?: {
    online?: number;
    offline?: number;
    totalCpu?: number;
    totalMem?: number;
    overview?: [
      {
        name?: string;
        status?: number;
        uuid?: string;
        mem?: number;
        cpu?: number;
      },
    ];
  };
  settings?: Settings;
};

export type LogsSettings = {
  serverRetention: number;
  ansibleRetention: number;
};

export type DashboardSettings = {
  performance: {
    minMem: number;
    maxCpu: number;
  };
};

export type Settings = {
  apiKey: string;
  updateAvailable?: string;
  device: {
    considerOffLineAfter: number;
  };
  server: {
    version: string;
    deps: any;
    processes: any;
  };
  logs: LogsSettings;
  stats: StatsSettings,
  userSpecific: {
    userLogsLevel: UserLogsLevel;
  };
  dashboard: DashboardSettings;
  ssmDataPath: string;
  masterNodeUrl: string;
};

export type StatsSettings = {
  deviceStatsRetention: number;
  containerStatsRetention: number;
};

export type UserLogsLevel = {
  terminal: number;
};

export type ErrorResponse = {
  errorCode: string;
  errorMessage?: string;
  success?: boolean;
};

export type FakeCaptcha = {
  code?: number;
  status?: string;
};

export type LoginParams = {
  username?: string;
  password?: string;
  type?: string;
};

export type LoginInfo = {
  currentAuthority?: string;
};

export type LoginResult = {
  success: boolean;
  data: LoginInfo;
};

export type NoticeIconItem = {
  id?: string;
  extra?: string;
  key?: string;
  read?: boolean;
  avatar?: string;
  title?: string;
  status?: string;
  datetime?: string;
  description?: string;
  type?: NoticeIconItemType;
};

export type NoticeIconItemType = 'notification' | 'message' | 'event';

export type NoticeIconList = {
  data?: NoticeIconItem[];
  total?: number;
  success?: boolean;
};

export type PageParams = {
  current?: number;
  pageSize?: number;
};

export type DeviceList = {
  data?: DeviceItem[];
  total?: number;
  success?: boolean;
};

export type NewDevice = {
  data: { device: DeviceItem };
  success: boolean;
};

export type CheckAnsibleConnection = {
  taskId: string;
}

export type CheckDockerConnection = {
  connectionStatus: string;
  errorMessage?: string;
}

export type CheckRemoteSystemInformationConnection = {
  connectionStatus: string;
  errorMessage?: string;
}

export type DeviceCapabilities = {
  containers: {
    docker: {
      enabled : boolean;
    },
    proxmox: {
      enabled : boolean;
    },
    lxd: {
      enabled : boolean;
    }
  }
};

export type ProxmoxConfiguration = {
  watchContainersCron?: string;
}

export type SystemInformationConfiguration = {
  system?: {
    watch?: boolean;
    cron?: string;
  };
  os?: {
    watch?: boolean;
    cron?: string;
  };
  cpu?: {
    watch?: boolean;
    cron?: string;
  };
  cpuStats?: {
    watch?: boolean;
    cron?: string;
  };
  mem?: {
    watch?: boolean;
    cron?: string;
  };
  memStats?: {
    watch?: boolean;
    cron?: string;
  };
  networkInterfaces?: {
    watch?: boolean;
    cron?: string;
  };
  versions?: {
    watch?: boolean;
    cron?: string;
  };
  usb?: {
    watch?: boolean;
    cron?: string;
  };
  wifi?: {
    watch?: boolean;
    cron?: string;
  };
  bluetooth?: {
    watch?: boolean;
    cron?: string;
  };
  graphics?: {
    watch?: boolean;
    cron?: string;
  };
  fileSystem?: {
    watch?: boolean;
    cron?: string;
  };
  fileSystemStats?: {
    watch?: boolean;
    cron?: string;
  };
};

export type DeviceConfiguration = {containers: {
      proxmox?: {
        watchContainersCron?: string;
      };
      docker?: {
        watchContainers?: boolean;
        watchContainersCron?: string;
        watchContainersStats?: boolean;
        watchContainersStatsCron?: string;
        watchEvents?: boolean;
        watchAll?: boolean;
      };
    };
    systemInformation?:SystemInformationConfiguration;
  };

export type DeviceSystemInformation = {
  system?: Systeminformation.SystemData;
  os?: Systeminformation.OsData;
  cpu?: Systeminformation.CpuData;
  mem?: Partial<Systeminformation.MemData>;
  networkInterfaces?: Systeminformation.NetworkInterfacesData[];
  versions?: Systeminformation.VersionData;
  usb?: Systeminformation.UsbData[];
  wifi?: Systeminformation.WifiInterfaceData[];
  bluetooth?: Systeminformation.BluetoothDeviceData[];
  graphics?: Systeminformation.GraphicsData;
  fileSystems?: Systeminformation.DiskLayoutData[];
};

export type DeviceItem = {
  uuid: string;
  capabilities: DeviceCapabilities;
  configuration: DeviceConfiguration;
  disabled?: boolean;
  hostname?: string;
  fqdn?: string;
  ip?: string;
  status: number;
  uptime?: number;
  systemInformation:DeviceSystemInformation;
  agentType?: string;
  agentVersion?: string;
  updatedAt?: string;
  createdAt?: string;
};

export type Cron = {
  name: string;
  disabled?: boolean;
  lastExecution?: Date;
  expression?: string;
};

export type Exec = {
  data: ExecId;
  success?: boolean;
};

export type ExecId = {
  execId: string;
}

export type ExecLog = {
  content: string;
  createdAt: Date;
  stdout?: string;
  ident: string;
  logRunnerId: string;
};

export type ExecLogs = {
  execId: string;
  execLogs?: ExecLog[];
}

export type ExecLogsResponse = {
  data: ExecLogs;
  success?: boolean;
};

export type ExecStatus = {
  ident: string;
  status: string;
  createdAt: Date;
};
export type ExecStatuses = {
  execId: string;
  execStatuses?: ExecStatus[];
}
export type ExecStatusesResponse = {
  data: ExecStatuses;
  success?: boolean;
};

export type Tasks = {
  data?: Task[];
  success?: boolean;
};

export type Task = {
  ident: string;
  status: string;
  cmd: string;
  createdAt: string;
  updatedAt: string;
};

export type DeviceStatParams = {
  from?: number;
};

export type DashboardDevicesStatParams = {
  from?: number;
  to?: number;
};

export type DeviceStats = {
  data?: DeviceStat[];
  success?: boolean;
};

export type DeviceStat = {
  date: string;
  value: number;
};

export type ContainerStats = {
  data?: ContainerStat[];
  success?: boolean;
};

export type ContainerAveragedStats = {
  data?: {
    cpuStats: ContainerStat[];
    memStats: ContainerStat[];
  };
  success?: boolean;
};


export type ContainerStat = {
  date: string;
  value: number;
};

export type SimpleDeviceStat = {
  value: number;
};

export type AveragedDeviceStat = {
  data?: [{ value: number; name: string }];
  success?: boolean;
};

export type PlaybookFile = {
  name: string;
  uuid: string;
  path: string;
  custom?: boolean;
  extraVars?: ExtraVars;
  playableInBatch?: boolean;
};

export type PlaybooksRepository = {
  name: string;
  uuid: string;
  path: string;
  type: RepositoryType;
  children?: ExtendedTreeNode[];
  directoryExclusionList?: string[];
};

export type ServerLog = {
  time: string;
  pid: number;
  level: number;
  msg: string;
  req: any;
  res: any;
  err: any;
};

export type DeviceAuthResponse = {
  data: DeviceAuth;
};

export type ProxmoxAuth = {
  remoteConnectionMethod?: SsmProxmox.RemoteConnectionMethod;
  connectionMethod?: SsmProxmox.ConnectionMethod;
  ignoreSslErrors?: boolean;
  port?: number;
  userPwd?: {
    username?: string;
    password?: string;
  };
  tokens?: {
    tokenId?: string;
    tokenSecret?: string;
  };
}

export type DeviceAuth = {
  authType: string;
  sshPort: number;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
  sshConnection?: SSHConnection;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
  proxmoxAuth?: ProxmoxAuth;
};

export type DeviceAuthParams = {
  authType: string;
  sshPort: number;
  sshKey?: string;
  sshPwd?: string;
  sshUser?: string;
  sshKeyPass?: string;
  sshConnection?: SSHConnection;
  becomeMethod?: string;
  becomePass?: string;
  becomeUser?: string;
  becomeExe?: string;
  becomeFlags?: string;
  strictHostChecking?: boolean;
  sshCommonArgs?: string;
  sshExecutable?: string;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
};

export type DeviceDockerAuthParams = {
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
};

export type UserSettingsResetApiKey = {
  uuid: string;
};

export type PerformanceStatResponse = {
  data?: PerformanceStat;
  success?: boolean;
};

export type PerformanceStat = {
  currentMem: number;
  previousMem: number;
  currentCpu: number;
  previousCpu: number;
  danger: boolean;
  message: string;
};

export type DeviceStatAvailability = {
  data?: AvailabilityStat;
  success?: boolean;
};

export type AvailabilityStat = {
  availability: number;
  lastMonth: number;
  byDevice: [
    { uuid: string; uptime: number; downtime: number; availability: number },
  ];
};


export type ExtraVar = {
  extraVar: string;
  value?: string;
  required?: boolean;
  type?: ExtraVarsType;
  deletable?: boolean;
};

export type Image = {
  id: string;
  registry: {
    name: string;
    url: string;
  };
  name: string;
  tag: {
    value: string;
    semver?: boolean;
  };
  digest: {
    watch?: boolean;
    value?: string;
    repo?: string;
  };
  architecture: string;
  os: string;
  variant?: string[];
  created?: string;
};

export type ContainerUpdate = {
  kind: 'tag' | 'digest' | 'unknown';
  localValue?: string;
  remoteValue?: string;
  semverDiff?: 'major' | 'minor' | 'patch' | 'prerelease' | 'unknown';
}

export type ContainerInspectResult = {
  tag?: string;
  digest?: string;
  created?: string;
  link?: string;
}

export type ContainerPort = {
  IP: string; PrivatePort: number; PublicPort: number; Type: string;
}

export type NetworkInfo = {
  IPAMConfig?: any;
  Links?: any;
  Aliases?: any;
  NetworkID: string;
  EndpointID: string;
  Gateway: string;
  IPAddress: string;
  IPPrefixLen: number;
  IPv6Gateway: string;
  GlobalIPv6Address: string;
  GlobalIPv6PrefixLen: number;
  MacAddress: string
}

export type Mounts = {
  Name?: string | undefined;
  Type: string;
  Source: string;
  Destination: string;
  Driver?: string | undefined;
  Mode: string;
  RW: boolean;
  Propagation: string
}

export type DockerContainer = {
  updateAvailable?: boolean;
  image?: Image;
  updateKind?: ContainerUpdate;
  result?: ContainerInspectResult;
  networkSettings?: { [p: string]: NetworkInfo };
  mounts?: Mounts[];
  ports?: ContainerPort[];
}

export type ProxmoxContainer = {
  uuid?: string;
  node?: string;
  type?: SsmProxmox.ContainerType;
  config?: ProxmoxModel.nodesLxcConfigVmConfig | ProxmoxModel.nodesQemuConfigVmConfig;
  interfaces?: ProxmoxModel.nodesLxcInterfacesIp[];
}

type CommonContainerFields = {
  device?: DeviceItem;
  displayType?: ContainerTypes;
  id?: string;
  name?: string;
  customName?: string;
  watcher?: string;
  status?: string;
  updatedAt?: Date;
};

export type Container =
  | (DockerContainer & { displayType: ContainerTypes.DOCKER } & CommonContainerFields)
  | (ProxmoxContainer & { displayType: ContainerTypes.PROXMOX } & CommonContainerFields);


export type ContainerResult = {
  container?: any;
}

export type ContainersResponse = SimpleResult & {
  data?: Container[];
}

export type ContainerRegistries = {
  registries?: ContainerRegistry[];
}

export type ContainerRegistryResponse = SimpleResult & {
  data?: ContainerRegistries;
}

export type ContainerRegistry = {
  name: string;
  fullName: string;
  authScheme: any;
  provider: string;
  authSet: boolean;
  canAuth: boolean;
  canAnonymous: boolean;
}

export type GitPlaybooksRepository = PlaybooksRepository & {
  email: string;
  branch: string;
  userName: string;
  remoteUrl: string;
  default: boolean;
  gitService: Services;
  accessToken?: string;
  onError?: boolean;
  onErrorMessage?: string;
}

export type LocalPlaybooksRepository = PlaybooksRepository & {
  directory: string;
  enabled: boolean;
  default: boolean;
}

export type GitContainerStacksRepository = {
  email: string;
  branch: string;
  userName: string;
  remoteUrl: string;
  default: boolean;
  name: string;
  uuid: string;
  matchesList?: string[];
  onError?: boolean;
  onErrorMessage?: string;
  gitService: Services;
  accessToken?: string;
}

export type ExtraVars = ExtraVar[];

export type Automation = {
  name: string;
  uuid: string;
  automationChains: AutomationChain;
  lastExecutionStatus: 'failed' | 'success';
  lastExecutionTime: Date;
  enabled: boolean;
}

export type InAppNotification = {
  message: string;
  severity: 'info' | 'warning' | 'error';
  event: string;
  module: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  seen: boolean;
}

export type Template = {
  logo: string;
  title: string;
  name: string;
  description: string;
  categories: string[];
  restart_policy?: string;
  privileged?: boolean;
  command?: string;
  network?: string;
  ports: {
    host: string;
    container: string;
    protocol: string;
  }[];
  image: string;
  volumes?: [
    {
      bind?: string;
      container: string;
      mode?: string;
      readonly?: boolean;
    },
  ];
  env?: [
    {
      name: string;
      label: string;
      default: string;
      preset?: boolean;
    },
  ];
  labels?: [
    {
      name: string;
      value: string;
    },
  ];
};

export type Targets = { targets: string[]; }

export type ContainerNetwork = {
  _id?: any;
  name: string;
  status: string;
  watcher: string;
  id: string;
  device: DeviceItem;
  created: string;
  scope: string;
  driver: string;
  enableIPv6: boolean;
  ipam?: any | undefined;
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  configFrom?: { Network: string } | undefined;
  configOnly: boolean;
  containers?: { [id: string]: any } | undefined;
  options?: { [key: string]: string } | undefined;
  labels?: { [key: string]: string } | undefined;
}

export type ContainerVolume = {
  uuid: string;
  name: string;
  device: DeviceItem;
  watcher: string;
  driver: string;
  mountPoint: string;
  status?: { [p: string]: string } | undefined;
  labels: { [p: string]: string };
  scope: 'local' | 'global';
  options: { [p: string]: string } | null;
  usageData?: { Size: number; RefCount: number } | null | undefined;
}

export type ContainerImage = {
  id: string;
  watcher: string;
  device: DeviceItem;
  parentId: string;
  repoTags: string[] | undefined;
  repoDigests?: string[] | undefined;
  created: number;
  size: number;
  virtualSize: number;
  sharedSize: number;
  labels: { [p: string]: string };
  containers: number;
}

export type AnsibleConfig = {
  [key: string]: {
    [subKey: string]: string | { value: string; deactivated?: boolean; description?: string };
  };
};

export type SmartFailure = {
  id: string,
  message: string,
  cause: string,
  resolution: string,
}

export type CreateNetworkConfig = {
  name: string,
  network: string,
  v4_subnet: string,
  v4_gateway: string,
  v4_range: string,
  v6_subnet?: string;
  v6_gateway?: string;
  v6_range?: string;
  v4_excludedIps?: string[],
  v6_excludedIps?: string[],
  labels?: [{ name: string, value: string }]
}

export type CreateNetwork = {
  target: string,
  config: CreateNetworkConfig
}

export type BackupVolumeConfig = {
  volumeUuid: string;
}

export type BackupVolume = {
  target: string,
  config: BackupVolumeConfig
}

export type CreateNetworkVolumeConfig = {
  name: string,
}


export type CreateVolume = {
  target: string,
  config: CreateNetworkVolumeConfig
}

export type ContainerCustomStack = {
  uuid: string;
  json: object;
  yaml: string;
  name: string;
  type: string;
  rawStackValue: object;
  lockJson: boolean;
  icon: string;
  iconColor: string;
  iconBackgroundColor: string;
}

export type ContainerTransformCustomStack = {
  yaml: string;
}

export type ContainerCustomStackValidation = {
  validating: boolean;
  message?: string;
}

export type DeployContainerCustomStacks = {
  targets: string;
}

export type BackupVolumeResponse = {
  filePath: string;
  fileName: string;
  mode: VolumeBackupMode;
};

export type SFTPContent = {
  filename: string;
  longname: string;
  isFile: boolean;
  isDir: boolean;
  isSymbolicLink: boolean;
  isCharacterDevice: boolean;
  isBlockDevice: boolean;
  isSocket: boolean;
  isFIFO: boolean;
  size: number;
  mode: number;
  uid: number;
  gid: number;
};

import { ExtraVarsType, SSHConnection, SSHType } from '../enums/ansible';
import { PlaybooksRepositoryType } from '../enums/playbooks';
import { AutomationChain } from '../form/automation';
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
  device: {
    registerDeviceStatEvery: number;
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

export type VersionData = {
  kernel?: string;
  openssl?: string;
  systemOpenssl?: string;
  systemOpensslLib?: string;
  node?: string;
  v8?: string;
  npm?: string;
  yarn?: string;
  pm2?: string;
  gulp?: string;
  grunt?: string;
  git?: string;
  tsc?: string;
  mysql?: string;
  redis?: string;
  mongodb?: string;
  nginx?: string;
  php?: string;
  docker?: string;
  postfix?: string;
  postgresql?: string;
  perl?: string;
  python?: string;
  python3?: string;
  pip?: string;
  pip3?: string;
  java?: string;
  gcc?: string;
  virtualbox?: string;
  dotnet?: string;
};

export type RaspberryRevisionData = {
  manufacturer?: string;
  processor?: string;
  type?: string;
  revision?: string;
};

export type DeviceItem = {
  uuid: string;
  disabled?: boolean;
  dockerWatcher?: boolean;
  dockerWatcherCron?: string;
  dockerStatsWatcher?: boolean,
  dockerStatsCron?: string;
  dockerEventsWatcher?: boolean;
  hostname?: string;
  fqdn?: string;
  ip?: string;
  status: number;
  uptime?: number;
  osArch?: string;
  osPlatform?: string;
  osDistro?: string;
  osCodeName?: string;
  osKernel?: string;
  osLogoFile?: string;
  systemManufacturer?: string;
  systemModel?: string;
  systemVersion?: string;
  systemUuid?: string;
  systemSku?: string;
  systemVirtual?: boolean;
  cpuBrand?: string;
  cpuManufacturer?: string;
  cpuFamily?: string;
  cpuSpeed?: number;
  mem?: number;
  versions?: VersionData;
  raspberry?: RaspberryRevisionData;
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
  type: PlaybooksRepositoryType;
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
};

export type DeviceAuthResponse = {
  data: DeviceAuth;
};

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

export type OSInfo = {
  distro?: string;
  release?: string;
  codename?: string;
  platform?: string;
  arch?: string;
  kernel?: string;
  logofile?: string;
  versionData?: VersionData;
};

export type SystemInfo = {
  manufacturer?: string;
  model?: string;
  version?: string;
  platform?: string;
  uuid?: string;
  sku?: string;
  virtual?: boolean;
  raspberry?: RaspberryRevisionData;
};

export type CPUInfo = {
  usage?: number;
  free?: number;
  count?: number;
  brand?: string;
  manufacturer?: string;
  vendor?: string;
  family?: string;
  speed?: number;
  cores?: number;
  physicalCores?: number;
  processors?: number;
};

export type MemInfo = {
  memTotalMb?: number;
  memTotalUsedMb?: number;
  memTotalFreeMb?: number;
  memUsedPercentage?: number;
  memFreePercentage?: number;
};

export type DriveInfo = {
  storageTotalGb?: string;
  storageUsedGb?: string;
  storageFreeGb?: string;
  storageUsedPercentage?: string;
  storageFreePercentage?: string;
};

export type DeviceInfo = {
  id: string;
  os?: OSInfo;
  ip?: string;
  uptime?: number;
  hostname?: string;
  fqdn?: string;
  mem?: MemInfo;
  storage?: DriveInfo;
  system?: SystemInfo;
  cpu?: CPUInfo;
  agentVersion?: string;
  logPath?: string;
  agentType?: 'node' | 'docker';
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

export type Container = {
  device?: DeviceItem;
  id?: string;
  name?: string;
  customName?: string;
  watcher?: string;
  updateAvailable?: boolean;
  status?: string;
  image?: Image;
  updateKind?: ContainerUpdate;
  result?: ContainerInspectResult;
  networkSettings?: { [p: string]: NetworkInfo };
  mounts?: Mounts[];
  ports?: ContainerPort[];
  updatedAt?: Date;
}


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

export type GitRepository = PlaybooksRepository & {
  email: string;
  branch: string;
  userName: string;
  remoteUrl: string;
  default: boolean;
}

export type LocalRepository = PlaybooksRepository & {
  directory: string;
  enabled: boolean;
  default: boolean;
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

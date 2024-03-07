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
  notifyCount?: number;
  unreadCount?: number;
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
  userSpecific: {
    userLogsLevel: UserLogsLevel;
  };
  dashboard: DashboardSettings;
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
  autoLogin?: boolean;
 type?: string;
};

export type LoginResult = {
  status?: string;
  currentAuthority?: string;
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

export type DeviceListParams = {
  current?: number;
  pageSize?: number;
};

export type Cron = {
  name: string;
  disabled?: boolean;
  lastExecution?: Date;
  expression?: string;
};

export type Exec = {
  data: { execId: string };
  success?: boolean;
};
export type ExecLog = {
  content: string;
  createdAt: string;
  stdout?: string;
  ident: string;
  logRunnerId: string;
};
export type ExecLogs = {
  data: {
    execId: string;
    execLogs?: ExecLog[];
  };
  success?: boolean;
};

export type ExecStatus = {
  ident: string;
  status: string;
  createdAt: string;
};

export type ExecStatuses = {
  data: {
    execId: string;
    execStatuses?: ExecStatus[];
  };
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
};

export type DeviceStats = {
  data?: DeviceStat[];
  success?: boolean;
};

export type DeviceStat = {
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
export type PlaybookFileList = {
  label: string;
  value: string;
};

export type Playbooks = {
  success?: boolean;
  data?: PlaybookFileList[];
};

export type PlaybookContent = {
  success?: boolean;
  data?: string;
};

export type PlaybookOpResponse = {
  success?: boolean;
};

export type ServerLogs = {
  data?: ServerLog[];
  success?: boolean;
};

export type ServerLog = {
  time: string;
  pid: number;
  level: number;
  msg: string;
};

export type DeviceAuthResponse = {
 type: string;
  sshPort: number;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
};

export type DeviceAuthParams = {
 type: string;
  sshPort: number;
  sshKey?: string;
  sshPwd?: string;
  sshUser?: string;
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
};

declare namespace API {
  type HasUsers = {
    success?: boolean;
    data?: { hasUsers?: boolean };
  };

  type SimpleResult = {
    success?: boolean;
  };

  type CurrentUser = {
    name?: string;
    avatar?: string;
    email?: string;
    notifyCount?: number;
    unreadCount?: number;
    access?: string;
    devices?: {
      online?: number;
      offline?: number;
      statuses?: [{ name?: string; status?: string }];
    };
    settings?: Settings;
  };

  type Settings = {
    apiKey: string;
    device: {
      considerOffLineAfter: number;
    };
    server: {
      version: string;
      deps: any;
      processes: any;
    };
    logsLevel: UserLogsLevel;
  };

  type UserLogsLevel = {
    terminal: number;
  };

  type ErrorResponse = {
    errorCode: string;
    errorMessage?: string;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type LoginResult = {
    status?: string;
    currentAuthority?: string;
  };

  type NoticeIconItem = {
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

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconList = {
    data?: NoticeIconItem[];
    total?: number;
    success?: boolean;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type DeviceList = {
    data?: DeviceItem[];
    total?: number;
    success?: boolean;
  };

  type VersionData = {
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

  type DeviceItem = {
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
    updatedAt?: string;
    createdAt?: string;
  };

  type DeviceListParams = {
    current?: number;
    pageSize?: number;
  };

  type Cron = {
    name: string;
    disabled?: boolean;
    lastExecution?: Date;
    expression?: string;
  };

  type Exec = {
    data: { execId: string };
    success?: boolean;
  };
  type ExecLog = {
    content: string;
    createdAt: string;
    stdout?: string;
    ident: string;
    logRunnerId: string;
  };
  type ExecLogs = {
    data: {
      execId: string;
      execLogs?: ExecLog[];
    };
    success?: boolean;
  };

  type ExecStatus = {
    ident: string;
    status: string;
    createdAt: string;
  };

  type ExecStatuses = {
    data: {
      execId: string;
      execStatuses?: ExecStatus[];
    };
    success?: boolean;
  };

  type Tasks = {
    data?: Task[];
    success?: boolean;
  };

  type Task = {
    ident: string;
    status: string;
    cmd: string;
    createdAt: string;
    updatedAt: string;
  };

  type DeviceStatParams = {
    from?: number;
  };

  type DeviceStats = {
    data?: DeviceStat[];
    success?: boolean;
  };
  type DeviceStat = {
    date: string;
    value: number;
  };
  type SimpleDeviceStat = {
    value: number;
  };

  type PlaybookFileList = {
    label: string;
    value: string;
  };

  type Playbooks = {
    success?: boolean;
    data?: PlaybookFileList[];
  };

  type PlaybookContent = {
    success?: boolean;
    data?: string;
  };

  type PlaybookOpResponse = {
    success?: boolean;
  };

  type ServerLogs = {
    data?: ServerLog[];
    success?: boolean;
  };

  type ServerLog = {
    time: string;
    pid: number;
    level: number;
    msg: string;
  };

  type DeviceAuthResponse = {
    type: string;
    sshPort: number;
    sshUser?: string;
    sshPwd?: string;
    sshKey?: string;
  };

  type DeviceAuthParams = {
    type: string;
    sshPort: number;
    sshKey?: string;
    sshPwd?: string;
    sshUser?: string;
  };

  type UserSettingsResetApiKey = {
    uuid: string;
  };
}

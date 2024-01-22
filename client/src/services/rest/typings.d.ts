declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
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
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type getFakeCaptchaParams = {
    /** 手机号 */
    phone?: string;
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
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type DeviceList = {
    data?: DeviceItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
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
}

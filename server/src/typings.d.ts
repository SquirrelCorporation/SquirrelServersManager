export declare namespace API {
  type SimpleResponse = {
    success?: boolean;
  };

  type Cron = {
    name?: string;
    eventsCount?: number;
  };

  type CurrentUser = {
    name?: string;
    avatar?: string;
    email?: string;
    notifyCount?: number;
    unreadCount?: number;
    access?: string;
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

  type getFakeCaptchaParams = {
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
    type?: string;
    currentAuthority?: string;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

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

  type NoticeIconList = {
    data?: NoticeIconItem[];
    total?: number;
    success?: boolean;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type Device = {
    uuid?: string;
    disabled?: boolean;
    hostname?: string;
    ip?: string;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
    type?: string;
  };

  type DeviceList = {
    data?: Device[];
    total?: number;
    success?: boolean;
  };

  type DeviceParams = {
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  };

  type DeviceAuthParams = {
    type: string;
    sshPort: number;
    sshKey?: string;
    sshPwd?: string;
    sshUser?: string;
  };

  type OSInfo = {
    distro?: string;
    release?: string;
    codename?: string;
    platform?: string;
    arch?: string;
    kernel?: string;
    logofile?: string;
    versionData?: VersionData;
  };

  type RaspberryRevisionData = {
    manufacturer: string;
    processor: string;
    type: string;
    revision: string;
  };

  type SystemInfo = {
    manufacturer?: string;
    model?: string;
    version?: string;
    platform?: string;
    uuid?: string;
    sku?: string;
    virtual?: boolean;
    raspberry?: RaspberryRevisionData;
  };

  type CPUInfo = {
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

  type MemInfo = {
    memTotalMb?: number;
    memTotalUsedMb?: number;
    memTotalFreeMb?: number;
    memUsedPercentage?: number;
    memFreePercentage?: number;
  };

  type DriveInfo = {
    storageTotalGb?: string;
    storageUsedGb?: string;
    storageFreeGb?: string;
    storageUsedPercentage?: string;
    storageFreePercentage?: string;
  };

  type DeviceInfo = {
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
}

export default API;

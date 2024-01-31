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

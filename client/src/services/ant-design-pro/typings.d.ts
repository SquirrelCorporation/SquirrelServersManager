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
    type?: string;
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
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  };

  type Cron = {
    name: string;
    disabled?: boolean;
    lastExecution?: Date;
    expression?: string;
  }
}

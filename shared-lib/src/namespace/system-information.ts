// Type definitions for systeminformation
// Project: https://github.com/sebhildebrandt/systeminformation
// Definitions by: sebhildebrandt <https://github.com/sebhildebrandt>


export namespace Systeminformation {
  // 1. General

  export interface TimeData {
    current: number;
    uptime: number;
    timezone: string;
    timezoneName: string;
  }

  // 2. System (HW)

  export interface RaspberryRevisionData {
    manufacturer: string;
    processor: string;
    type: string;
    revision: string;
  }
  export interface SystemData {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    uuid: string;
    sku: string;
    virtual: boolean;
    virtualHost?: string;
    raspberry?: RaspberryRevisionData;
    type?: string;
  }

  export interface BiosData {
    vendor: string;
    version: string;
    releaseDate: string;
    revision: string;
    serial?: string;
    language?: string;
    features?: string[];
  }

  export  interface BaseboardData {
    manufacturer: string;
    model: string;
    version: string;
    serial: string;
    assetTag: string;
    memMax: number | null;
    memSlots: number | null;
  }

  export interface ChassisData {
    manufacturer: string;
    model: string;
    type: string;
    version: string;
    serial: string;
    assetTag: string;
    sku: string;
  }

  // 3. CPU, Memory, Disks, Battery, Graphics

  export  interface CpuData {
    manufacturer: string;
    brand: string;
    vendor: string;
    family: string;
    model: string;
    stepping: string;
    revision: string;
    voltage: string;
    speed: number;
    speedMin: number;
    speedMax: number;
    governor: string;
    cores: number;
    physicalCores: number;
    efficiencyCores?: number;
    performanceCores?: number;
    processors: number;
    socket: string;
    flags: string;
    virtualization: boolean;
    cache: CpuCacheData;
  }

  export  interface CpuCacheData {
    l1d: number | string | null;
    l1i: number | string | null;
    l2: number | string | null;
    l3: number | string | null;
    cache?: any;
  }

  export  interface CpuCurrentSpeedData {
    min: number;
    max: number;
    avg: number;
    cores: number[];
  }

  export  interface CpuTemperatureData {
    main: number | null;
    cores: number[];
    max: number | null;
    socket?: number[];
    chipset?: number | null;
  }

  export  interface MemData {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    buffcache: number;
    buffers: number;
    cached: number;
    slab: number;
    swaptotal: number;
    swapused: number;
    swapfree: number;
    writeback: number | null;
    dirty: number | null;
  }

  export interface MemLayoutData {
    size: number;
    bank: string;
    type: string;
    ecc?: boolean | null;
    clockSpeed: number | null;
    formFactor: string;
    manufacturer?: string;
    partNum: string;
    serialNum: string;
    voltageConfigured: number | null;
    voltageMin: number | null;
    voltageMax: number | null;
  }

  export interface SmartData {
    json_format_version: number[];
    smartctl: {
      version: number[];
      platform_info: string;
      build_info: string;
      argv: string[];
      exit_status: number;
    };
    device: {
      name: string;
      info_name: string;
      type: string;
      protocol: string;
    };
    model_family?: string;
    model_name?: string;
    serial_number?: string;
    firmware_version?: string;
    smart_status: {
      passed: boolean;
    };
    trim?: {
      supported: boolean;
    };
    ata_smart_attributes?: {
      revision: number;
      table: {
        id: number;
        name: string;
        value: number;
        worst: number;
        thresh: number;
        when_failed: string;
        flags: {
          value: number;
          string: string;
          prefailure: boolean;
          updated_online: boolean;
          performance: boolean;
          error_rate: boolean;
          event_count: boolean;
          auto_keep: boolean;
        };
        raw: {
          value: number;
          string: string;
        };
      }[];
    };
    ata_smart_error_log?: {
      summary: {
        revision: number;
        count: number;
      };
    };
    ata_smart_self_test_log?: {
      standard: {
        revision: number;
        table: {
          type: {
            value: number;
            string: string;
          };
          status: {
            value: number;
            string: string;
            passed: boolean;
          };
          lifetime_hours: number;
        }[];
        count: number;
        error_count_total: number;
        error_count_outdated: number;
      };
    };
    nvme_pci_vendor?: {
      id: number;
      subsystem_id: number;
    };
    nvme_smart_health_information_log?: {
      critical_warning?: number;
      temperature?: number;
      available_spare?: number;
      available_spare_threshold?: number;
      percentage_used?: number;
      data_units_read?: number;
      data_units_written?: number;
      host_reads?: number;
      host_writes?: number;
      controller_busy_time?: number;
      power_cycles?: number;
      power_on_hours?: number;
      unsafe_shutdowns?: number;
      media_errors?: number;
      num_err_log_entries?: number;
      warning_temp_time?: number;
      critical_comp_time?: number;
      temperature_sensors?: number[];
    };
    user_capacity?: {
      blocks: number;
      bytes: number;
    };
    logical_block_size?: number;
    temperature: {
      current: number;
    };
    power_cycle_count: number;
    power_on_time: {
      hours: number;
    };
  }

  export  interface DiskLayoutData {
    device: string;
    type: string;
    name: string;
    vendor: string;
    size: number;
    bytesPerSector: number | null;
    totalCylinders: number | null;
    totalHeads: number | null;
    totalSectors: number | null;
    totalTracks: number | null;
    tracksPerCylinder: number | null;
    sectorsPerTrack: number | null;
    firmwareRevision: string;
    serialNum: string;
    interfaceType: string;
    smartStatus: string;
    temperature: null | number;
    smartData?: SmartData;
    BSDName?: string;
  }

  export interface BatteryData {
    hasBattery: boolean;
    cycleCount: number;
    isCharging: boolean;
    voltage: number;
    designedCapacity: number;
    maxCapacity: number;
    currentCapacity: number;
    capacityUnit: string;
    percent: number;
    timeRemaining: number;
    acConnected: boolean;
    type: string;
    model: string;
    manufacturer: string;
    serial: string;
    additionalBatteries?: BatteryData[];
  }

  export  interface GraphicsData {
    controllers: GraphicsControllerData[];
    displays: GraphicsDisplayData[];
  }

  export  interface GraphicsControllerData {
    vendor: string;
    subVendor?: string;
    vendorId?: string;
    model?: string;
    deviceId?: string;
    bus: string;
    busAddress?: string;
    vram: number | null;
    vramDynamic: boolean;
    external?: boolean;
    cores?: number;
    metalVersion?: string;
    subDeviceId?: string;
    driverVersion?: string;
    name?: string;
    pciBus?: string;
    pciID?: string;
    fanSpeed?: number;
    memoryTotal?: number;
    memoryUsed?: number;
    memoryFree?: number;
    utilizationGpu?: number;
    utilizationMemory?: number;
    temperatureGpu?: number;
    temperatureMemory?: number;
    powerDraw?: number;
    powerLimit?: number;
    clockCore?: number;
    clockMemory?: number;
  }

  export interface GraphicsDisplayData {
    vendor: string;
    vendorId: string | null;
    model: string;
    productionYear: number | null;
    serial: string | null;
    deviceName: string | null;
    displayId: string | null;
    main: boolean;
    builtin: boolean;
    connection: string | null;
    sizeX: number | null;
    sizeY: number | null;
    pixelDepth: number | null;
    resolutionX: number | null;
    resolutionY: number | null;
    currentResX: number | null;
    currentResY: number | null;
    positionX: number;
    positionY: number;
    currentRefreshRate: number | null;
  }

  // 4. Operating System

  export  interface OsData {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
    hostname: string;
    fqdn: string;
    codepage: string;
    logofile: string;
    serial: string;
    build: string;
    servicepack: string;
    uefi: boolean | null;
    hypervizor?: boolean;
    remoteSession?: boolean;
  }

  export  interface UuidData {
    os: string;
    hardware: string;
    macs: string[];
  }

  export interface VersionData {
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
    homebrew?: string;
    apache?: string;
    bash?: string;
    zsh?: string;
    fish?: string;
    bun?: string;
    deno?: string;
  }

  export interface UserData {
    user: string;
    tty: string;
    date: string;
    time: string;
    ip: string;
    command: string;
    domain?: string;
  }

  // 5. File System

  export interface FsSizeData {
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    use: number;
    mount: string;
    rw: boolean | null;
  }

  export interface FsOpenFilesData {
    max: number | null;
    allocated: number | null;
    available: number | null;
  }

  export  interface BlockDevicesData {
    name: string;
    identifier: string;
    type: string;
    fsType: string;
    mount: string;
    size: number;
    physical: string;
    uuid: string;
    label: string;
    model: string;
    serial: string;
    removable: boolean;
    protocol: string;
    group?: string;
    device?: string;
    vendor?: string;
    tran?: string;
    rev?: string;
  }

  export interface FsStatsData {
    rx: number;
    wx: number;
    tx: number;
    rx_sec: number | null;
    wx_sec: number | null;
    tx_sec: number | null;
    ms: number;
  }

  export interface DisksIoData {
    rIO: number;
    wIO: number;
    tIO: number;
    rIO_sec: number | null;
    wIO_sec: number | null;
    tIO_sec: number | null;
    rWaitTime: number;
    wWaitTime: number;
    tWaitTime: number;
    rWaitPercent: number | null;
    wWaitPercent: number | null;
    tWaitPercent: number | null;
    ms: number;
  }

  // 6. Network related functions

  export interface NetworkInterfacesData {
    iface: string;
    ifaceName: string;
    default: boolean;
    ip4: string;
    ip4subnet: string;
    ip6: string;
    ip6subnet: string;
    mac: string;
    internal: boolean;
    virtual: boolean;
    operstate: string;
    type: string;
    duplex: string;
    mtu: number | null;
    speed: number | null;
    dhcp: boolean;
    dnsSuffix: string;
    ieee8021xAuth: string;
    ieee8021xState: string;
    carrierChanges: number;
    name?: string;
    netEnabled?: boolean;
    vendor?: string;
    model?: string;
  }

  export  interface NetworkStatsData {
    iface: string;
    operstate: string;
    rx_bytes: number;
    rx_dropped: number;
    rx_errors: number;
    tx_bytes: number;
    tx_dropped: number;
    tx_errors: number;
    rx_sec: number | null;
    tx_sec: number | null;
    ms: number | null;
    name?: string;
  }

  export interface NetworkConnectionsData {
    protocol: string;
    localAddress: string;
    localPort: string;
    peerAddress: string;
    peerPort: string;
    state: string;
    pid: number | null;
    process: string;
  }

  export interface InetChecksiteData {
    url: string;
    ok: boolean;
    status: number;
    ms: number;
  }

  export interface WifiNetworkData {
    ssid: string;
    bssid: string;
    mode: string;
    channel: number | null;
    frequency: number | null;
    signalLevel: number | null;
    quality: number | null;
    security: string[];
    wpaFlags: string[];
    rsnFlags: string[];
  }

  export  interface WifiInterfaceData {
    id: string;
    iface: string;
    model: string;
    vendor: string;
    mac: string;
  }

  export interface WifiConnectionData {
    id: string;
    iface: string;
    model: string;
    ssid: string;
    bssid: string;
    channel: number | null;
    frequency: number | null;
    type: string;
    security: string | string[];
    signalLevel: number | null;
    quality: number | null;
    txRate: number | null;
  }

  // 7. Current Load, Processes & Services

  export interface CurrentLoadData {
    avgLoad: number;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    currentLoadNice: number;
    currentLoadIdle: number;
    currentLoadIrq: number;
    currentLoadSteal: number;
    currentLoadGuest: number;
    rawCurrentLoad: number;
    rawCurrentLoadUser: number;
    rawCurrentLoadSystem: number;
    rawCurrentLoadNice: number;
    rawCurrentLoadIdle: number;
    rawCurrentLoadIrq: number;
    rawCurrentLoadSteal: number;
    rawCurrentLoadGuest: number;
    cpus: CurrentLoadCpuData[];
  }

  export  interface CurrentLoadCpuData {
    load: number;
    loadUser: number;
    loadSystem: number;
    loadNice: number;
    loadIdle: number;
    loadIrq: number;
    loadSteal: number;
    loadGuest: number;
    rawLoad: number;
    rawLoadUser: number;
    rawLoadSystem: number;
    rawLoadNice: number;
    rawLoadIdle: number;
    rawLoadIrq: number;
    rawLoadSteal: number;
    rawLoadGuest: number;
  }

  export  interface ProcessesData {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    unknown: number;
    list: ProcessesProcessData[];
  }

  export  interface ProcessesProcessData {
    pid: number;
    parentPid: number;
    name: string;
    cpu: number;
    cpuu: number;
    cpus: number;
    mem: number;
    priority: number;
    memVsz: number;
    memRss: number;
    nice: number;
    started: string;
    state: string;
    tty: string;
    user: string;
    command: string;
    params: string;
    path: string;
  }

  export  interface ProcessesProcessLoadData {
    proc: string;
    pid: number;
    pids: number[];
    cpu: number;
    mem: number;
  }

  export  interface ServicesData {
    name: string;
    running: boolean;
    startmode: string;
    pids: number[];
    cpu: number;
    mem: number;
  }

  // 8. Docker

  export interface DockerInfoData {
    id: string;
    containers: number;
    containersRunning: number;
    containersPaused: number;
    containersStopped: number;
    images: number;
    driver: string;
    memoryLimit: boolean;
    swapLimit: boolean;
    kernelMemory: boolean;
    cpuCfsPeriod: boolean;
    cpuCfsQuota: boolean;
    cpuShares: boolean;
    cpuSet: boolean;
    ipv4Forwarding: boolean;
    bridgeNfIptables: boolean;
    bridgeNfIp6tables: boolean;
    debug: boolean;
    nfd: number;
    oomKillDisable: boolean;
    ngoroutines: number;
    systemTime: string;
    loggingDriver: string;
    cgroupDriver: string;
    nEventsListener: number;
    kernelVersion: string;
    operatingSystem: string;
    osType: string;
    architecture: string;
    ncpu: number;
    memTotal: number;
    dockerRootDir: string;
    httpProxy: string;
    httpsProxy: string;
    noProxy: string;
    name: string;
    labels: string[];
    experimentalBuild: boolean;
    serverVersion: string;
    clusterStore: string;
    clusterAdvertise: string;
    defaultRuntime: string;
    liveRestoreEnabled: boolean;
    isolation: string;
    initBinary: string;
    productLicense: string;
  }

  export interface DockerImageData {
    id: string;
    container: string;
    comment: string;
    os: string;
    architecture: string;
    parent: string;
    dockerVersion: string;
    size: number;
    sharedSize: number;
    virtualSize: number;
    author: string;
    created: number;
    containerConfig: any;
    graphDriver: any;
    repoDigests: any;
    repoTags: any;
    config: any;
    rootFS: any;
  }

  export  interface DockerContainerData {
    id: string;
    name: string;
    image: string;
    imageID: string;
    command: string;
    created: number;
    started: number;
    finished: number;
    createdAt: string;
    startedAt: string;
    finishedAt: string;
    state: string;
    restartCount: number;
    platform: string;
    driver: string;
    ports: number[];
    mounts: DockerContainerMountData[];
  }

  export  interface DockerContainerMountData {
    Type: string;
    Source: string;
    Destination: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }

  export  interface DockerContainerStatsData {
    id: string;
    memUsage: number;
    memLimit: number;
    memPercent: number;
    cpuPercent: number;
    pids: number;
    netIO: {
      rx: number;
      wx: number;
    };
    blockIO: {
      r: number;
      w: number;
    };
    restartCount: number;
    cpuStats: any;
    precpuStats: any;
    memoryStats: any;
    networks: any;
  }

  export interface DockerContainerProcessData {
    pidHost: string;
    ppid: string;
    pgid: string;
    user: string;
    ruser: string;
    group: string;
    rgroup: string;
    stat: string;
    time: string;
    elapsed: string;
    nice: string;
    rss: string;
    vsz: string;
    command: string;
  }

  export  interface DockerVolumeData {
    name: string;
    driver: string;
    labels: any;
    mountpoint: string;
    options: any;
    scope: string;
    created: number;
  }

  // 9. Virtual Box

  export  interface VboxInfoData {
    id: string;
    name: string;
    running: boolean;
    started: string;
    runningSince: number;
    stopped: string;
    stoppedSince: number;
    guestOS: string;
    hardwareUUID: string;
    memory: number;
    vram: number;
    cpus: number;
    cpuExepCap: string;
    cpuProfile: string;
    chipset: string;
    firmware: string;
    pageFusion: boolean;
    configFile: string;
    snapshotFolder: string;
    logFolder: string;
    hpet: boolean;
    pae: boolean;
    longMode: boolean;
    tripleFaultReset: boolean;
    apic: boolean;
    x2Apic: boolean;
    acpi: boolean;
    ioApic: boolean;
    biosApicMode: string;
    bootMenuMode: string;
    bootDevice1: string;
    bootDevice2: string;
    bootDevice3: string;
    bootDevice4: string;
    timeOffset: string;
    rtc: string;
  }

  export  interface PrinterData {
    id: number;
    name: string;
    model: string;
    uri: string;
    uuid: string;
    local: boolean;
    status: string;
    default: boolean;
    shared: boolean;
  }

  export interface UsbData {
    id: number | string;
    bus: number | null;
    deviceId: number | null;
    name: string;
    type: string;
    removable: boolean | null;
    vendor: string | null;
    manufacturer: string;
    maxPower: string | null;
    serialNumber: string | number | null;
  }

  export interface AudioData {
    id: number | string;
    name: string;
    manufacturer: string;
    default: boolean;
    revision: string;
    driver: string;
    channel: string;
    in: boolean;
    out: boolean;
    type: string;
    status: string;
  }

  export  interface BluetoothDeviceData {
    device: string | null;
    name: string | null;
    macDevice: string | null;
    macHost: string | null;
    batteryPercent: number | null;
    manufacturer: string | null;
    type: string;
    connected: boolean | null;
  }

  // 10. "Get All at once" - functions

  export interface StaticData {
    version: string;
    system: SystemData;
    bios: BiosData;
    baseboard: BaseboardData;
    chassis: ChassisData;
    os: OsData;
    uuid: UuidData;
    versions: VersionData;
    cpu: CpuData;
    graphics: GraphicsData;
    net: NetworkInterfacesData[];
    memLayout: MemLayoutData[];
    diskLayout: DiskLayoutData[];
  }

  export interface DynamicData {
    time: TimeData;
    node: string;
    v8: string;
    cpuCurrentSpeed: CpuCurrentSpeedData;
    users: UserData[];
    processes: ProcessesData[];
    currentLoad: CurrentLoadData;
    cpuTemperature: CpuTemperatureData;
    networkStats: NetworkStatsData[];
    networkConnections: NetworkConnectionsData[];
    mem: MemData;
    battery: BatteryData;
    services: ServicesData[];
    fsSize: FsSizeData;
    fsStats: FsStatsData;
    disksIO: DisksIoData;
    wifiNetworks: WifiNetworkData;
    inetLatency: number;
  }
}

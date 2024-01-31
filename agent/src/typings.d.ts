declare namespace ServerAPI {

  type OSInfo = {
    distro?: string;
    release?: string;
    codename?: string;
    platform?: string;
    arch?: string;
    kernel?: string;
    logofile?: string;
    versionData?: VersionData;
  }

  type RaspberryRevisionData = {
    manufacturer: string;
    processor: string;
    type: string;
    revision: string;
  }

  type SystemInfo = {
    manufacturer?: string;
    model?: string;
    version?: string;
    platform?: string;
    uuid?: string;
    sku?: string;
    virtual?: boolean;
    raspberry?: RaspberryRevisionData;
  }

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
  }

  type MemInfo = {
    memTotalMb?: number;
    memTotalUsedMb?: number;
    memTotalFreeMb?: number;
    memUsedPercentage?: number;
    memFreePercentage?: number;
  }

  type DriveInfo = {
    storageTotalGb?: string;
    storageUsedGb?: string;
    storageFreeGb?: string;
    storageUsedPercentage?: string;
    storageFreePercentage?: string;
  }

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
  }

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
  }
}

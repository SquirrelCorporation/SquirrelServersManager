import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SsmStatus, Systeminformation } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';

export type DeviceDocument = Device & Document;

export const DEVICE = 'Device';

@Schema({
  collection: 'devices',
  timestamps: true,
  versionKey: false,
})
export class Device {
  @Prop({ required: true, default: () => uuidv4() })
  uuid!: string;

  @Prop({ default: false })
  disabled?: boolean;

  @Prop({
    type: {
      containers: {
        docker: {
          enabled: { type: Boolean, default: false },
        },
        proxmox: {
          enabled: { type: Boolean, default: false },
        },
        lxd: {
          enabled: { type: Boolean, default: false },
        },
      },
    },
    default: {
      containers: {
        docker: { enabled: false },
        proxmox: { enabled: false },
        lxd: { enabled: false },
      },
    },
  })
  capabilities!: {
    containers: {
      docker?: {
        enabled: boolean;
      };
      proxmox?: {
        enabled: boolean;
      };
      lxd?: {
        enabled: boolean;
      };
    };
  };

  @Prop({
    type: {
      containers: {
        proxmox: {
          watchContainersCron: { type: String, default: '*/30 * * * * *' },
        },
        docker: {
          watchContainers: { type: Boolean, default: true },
          watchContainersCron: { type: String, default: '*/30 * * * * *' },
          watchContainersStats: { type: Boolean, default: true },
          watchContainersStatsCron: { type: String, default: '*/30 * * * * *' },
          watchEvents: { type: Boolean, default: true },
          watchAll: { type: Boolean, default: true },
        },
      },
      systemInformation: {
        system: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 0 1 * *' },
        },
        os: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 */12 * * *' },
        },
        cpu: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 0 1 * *' },
        },
        cpuStats: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '*/30 * * * * *' },
        },
        mem: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 0 1 * *' },
        },
        memStats: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '*/30 * * * * *' },
        },
        networkInterfaces: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 0 1 * *' },
        },
        versions: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 */6 * * *' },
        },
        usb: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 */8 * * *' },
        },
        wifi: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 */5 * * *' },
        },
        bluetooth: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 */12 * * *' },
        },
        graphics: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 0 1 * *' },
        },
        fileSystems: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '0 0 1 * *' },
        },
        fileSystemsStats: {
          watch: { type: Boolean, default: true },
          cron: { type: String, default: '*/30 * * * * *' },
        },
      },
    },
    default: {
      containers: {
        proxmox: { watchContainersCron: '*/30 * * * * *' },
        docker: {
          watchContainers: true,
          watchContainersCron: '*/30 * * * * *',
          watchContainersStats: true,
          watchContainersStatsCron: '*/30 * * * * *',
          watchEvents: true,
          watchAll: true,
        },
      },
      systemInformation: {
        system: { watch: true, cron: '0 0 1 * *' },
        os: { watch: true, cron: '0 */12 * * *' },
        cpu: { watch: true, cron: '0 0 1 * *' },
        cpuStats: { watch: true, cron: '*/30 * * * * *' },
        mem: { watch: true, cron: '0 0 1 * *' },
        memStats: { watch: true, cron: '*/30 * * * * *' },
        networkInterfaces: { watch: true, cron: '0 0 1 * *' },
        versions: { watch: true, cron: '0 */6 * * *' },
        usb: { watch: true, cron: '0 */8 * * *' },
        wifi: { watch: true, cron: '0 */5 * * *' },
        bluetooth: { watch: true, cron: '0 */12 * * *' },
        graphics: { watch: true, cron: '0 0 1 * *' },
        fileSystems: { watch: true, cron: '0 0 1 * *' },
        fileSystemsStats: { watch: true, cron: '*/30 * * * * *' },
      },
    },
  })
  configuration!: {
    containers: {
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
    systemInformation?: {
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
      fileSystems?: {
        watch?: boolean;
        cron?: string;
      };
      fileSystemsStats?: {
        watch?: boolean;
        cron?: string;
      };
    };
  };

  @Prop()
  dockerVersion?: string;

  @Prop()
  dockerId?: string;

  @Prop()
  hostname?: string;

  @Prop()
  fqdn?: string;

  @Prop({ default: SsmStatus.DeviceStatus.REGISTERING })
  status!: number;

  @Prop()
  uptime?: number;

  @Prop({ type: Object, default: {} })
  systemInformation!: {
    system?: Systeminformation.SystemData;
    os?: Systeminformation.OsData;
    cpu?: Systeminformation.CpuData;
    mem?: Partial<Systeminformation.MemData>;
    networkInterfaces?: Systeminformation.NetworkInterfacesData[];
    versions?: Systeminformation.VersionData;
    usb?: Systeminformation.UsbData;
    wifi?: Systeminformation.WifiInterfaceData[];
    bluetooth?: Systeminformation.BluetoothDeviceData[];
    graphics?: Systeminformation.GraphicsData;
    memLayout?: Systeminformation.MemLayoutData[];
    fileSystems?: Systeminformation.DiskLayoutData[];
  };

  @Prop()
  ip?: string;

  @Prop()
  agentVersion?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  agentLogPath?: string;

  @Prop({ enum: ['node', 'docker', 'less'] })
  agentType?: 'node' | 'docker' | 'less';
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
import { Schema, model } from 'mongoose';
import { SsmStatus, Systeminformation } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';

export const DOCUMENT_NAME = 'Device';
export const COLLECTION_NAME = 'devices';

export default interface Device {
  _id: string;
  uuid: string;
  disabled?: boolean;
  capabilities: {
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
  configuration: {
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
  dockerVersion?: string;
  dockerId?: string;
  hostname?: string;
  fqdn?: string;
  status: number;
  uptime?: number;
  systemInformation: {
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
  ip?: string;
  agentVersion?: string;
  createdAt?: Date;
  updatedAt?: Date;
  agentLogPath?: string;
  agentType?: 'node' | 'docker' | 'less';
}

const SystemInformationConfigurationSchema = new Schema<
  Device['configuration']['systemInformation']
>(
  {
    system: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 0 1 * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    os: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 */12 * * *', // Default to every 12 hours
      },
    },
    cpu: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 0 1 * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    mem: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 0 1 * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    networkInterfaces: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 0 1 * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    versions: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 */6 * * *', // Default to every 6 hour
      },
    },
    usb: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 */8 * * *', // Default to every 8 hours
      },
    },
    wifi: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 */5 * * *', // Default to every 5 hours
      },
    },
    bluetooth: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 */12 * * *', // Default to every 12 hours
      },
    },
    graphics: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 0 1 * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    memStats: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '*/30 * * * * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    cpuStats: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '*/30 * * * * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    fileSystems: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 0 1 * *', // Default to once a month (at midnight on the 1st day of the month)
      },
    },
    fileSystemsStats: {
      watch: {
        type: Schema.Types.Boolean,
        default: true,
      },
      cron: {
        type: Schema.Types.String,
        default: '0 */30 * * * *',
      },
    },
  },
  {
    _id: false, // Prevent `_id` creation for sub-schema
    timestamps: false, // Sub-schema doesn't need timestamps
  },
);

const DockerConfigurationSchema = new Schema<Device['configuration']['containers']['docker']>({
  watchContainers: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
  },
  watchContainersCron: {
    type: Schema.Types.String,
    required: true,
    default: '0 */4 * * *',
  },
  watchContainersStatsCron: {
    type: Schema.Types.String,
    required: true,
    default: '0 * * * *',
  },
  watchContainersStats: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
  },
  watchEvents: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
  },
});

const SystemInformationSchema = new Schema<Device['systemInformation']>({
  cpu: {
    type: Object,
    required: false,
  },
  mem: {
    type: Object,
    required: false,
  },
  versions: {
    type: Object,
    required: false,
  },
  fileSystems: {
    type: Object,
    required: false,
  },
  networkInterfaces: {
    type: Object,
    required: false,
  },
  os: {
    type: Object,
    required: false,
  },
  system: {
    type: Object,
    required: false,
  },
  usb: {
    type: Object,
    required: false,
  },
  bluetooth: {
    type: Object,
    required: false,
  },
  wifi: {
    type: Object,
    required: false,
  },
  graphics: {
    type: Object,
    required: false,
  },
});

const schema = new Schema<Device>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    capabilities: {
      containers: {
        docker: {
          enabled: {
            type: Schema.Types.Boolean,
            required: true,
            default: true,
          },
        },
        proxmox: {
          enabled: {
            type: Schema.Types.Boolean,
            required: true,
            default: false,
          },
        },
        lxd: {
          enabled: {
            type: Schema.Types.Boolean,
            required: true,
            default: false,
          },
        },
      },
    },
    configuration: {
      containers: {
        proxmox: {
          watchContainersCron: {
            type: Schema.Types.String,
            default: '0 */4 * * *',
          },
        },
        docker: {
          type: DockerConfigurationSchema,
          default: {},
        },
      },
      systemInformation: {
        type: SystemInformationConfigurationSchema,
        default: {},
      },
    },
    disabled: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    hostname: {
      type: Schema.Types.String,
      required: false,
    },
    fqdn: {
      type: Schema.Types.String,
      required: false,
    },
    ip: {
      type: Schema.Types.String,
      required: false,
      unique: false,
    },
    status: {
      type: Schema.Types.Number,
      default: SsmStatus.DeviceStatus.REGISTERING,
      required: true,
    },
    systemInformation: SystemInformationSchema,
    agentVersion: {
      type: Schema.Types.String,
      required: false,
    },
    dockerVersion: {
      type: Schema.Types.String,
      required: false,
    },
    dockerId: {
      type: Schema.Types.String,
      required: false,
    },
    agentLogPath: {
      type: Schema.Types.String,
      required: false,
    },
    agentType: {
      type: Schema.Types.String,
      required: false,
      default: 'node',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DeviceModel = model<Device>(DOCUMENT_NAME, schema, COLLECTION_NAME);

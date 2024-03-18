export enum GeneralSettingsKeys {
  SCHEME_VERSION = 'scheme-version',
  SERVER_LOG_RETENTION_IN_DAYS = 'server-log-retention-in-days',
  CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES = 'consider-device-offline-after-in-minutes',
  CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER = 'consider-performance-good-mem-if-greater',
  CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER = 'consider-performance-good-cpu-if-greater',
  CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS = 'clean-up-ansible',
  REGISTER_DEVICE_STAT_EVERY_IN_SECONDS = 'device-stat-frequency-in-seconds',
}

export enum AnsibleReservedExtraVarsKeys {
  MASTER_NODE_URL = 'ansible-master-node-url',
}

export enum DefaultValue {
  SCHEME_VERSION = '2',
  SERVER_LOG_RETENTION_IN_DAYS = '30',
  CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES = '3',
  CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER = '10',
  CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER = '90',
  CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS = '600',
  REGISTER_DEVICE_STAT_EVERY_IN_SECONDS = '60',
}

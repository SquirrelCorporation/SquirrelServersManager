export interface BaseFilter {
  type: string;
}

export interface DeviceFilter extends BaseFilter {
  type: 'device';
  deviceId: string;
}

export interface ContainerFilter extends BaseFilter {
  type: 'container';
  containerId: string;
}

export interface DevicesFilter extends BaseFilter {
  type: 'devices';
  deviceIds: string[];
}

export interface ContainersFilter extends BaseFilter {
  type: 'containers';
  containerIds: string[];
}

export type MetricsIdFilter = DeviceFilter | ContainerFilter;
export type MetricsIdsFilter = DevicesFilter | ContainersFilter;

export const isDevicesFilter = (filter: MetricsIdsFilter): filter is DevicesFilter =>
  filter.type === 'devices';

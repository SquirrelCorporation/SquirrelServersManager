import { Tag } from 'antd';
import DeviceStatus from '@/utils/devicestatus';

export type DeviceStatusTagType = {
  status: number;
};
const DeviceStatusTag = (deviceStatus: DeviceStatusTagType) => {
  switch (deviceStatus.status) {
    case DeviceStatus.REGISTERING:
      return (
        <Tag bordered={false} color="warning">
          Registering
        </Tag>
      );
    case DeviceStatus.ONLINE:
      return (
        <Tag bordered={false} color="success">
          Online
        </Tag>
      );
    case DeviceStatus.OFFLINE:
      return (
        <Tag bordered={false} color="error">
          Down
        </Tag>
      );
    case DeviceStatus.UNMANAGED:
      return (
        <Tag bordered={false} color="processing">
          Unmanaged
        </Tag>
      );
  }
};

export default DeviceStatusTag;

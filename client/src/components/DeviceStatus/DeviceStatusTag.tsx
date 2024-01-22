import { Tag } from 'antd';

export type DeviceStatusTagType = {
  status: number;
};
const DeviceStatusTag = (deviceStatus: DeviceStatusTagType) => {
  switch (deviceStatus.status) {
    case 0:
      return (
        <Tag bordered={false} color="processing">
          Registering
        </Tag>
      );
    case 1:
      return (
        <Tag bordered={false} color="success">
          Online
        </Tag>
      );
    case 2:
      return (
        <Tag bordered={false} color="error">
          Down
        </Tag>
      );
  }
};

export default DeviceStatusTag;

import { Tag } from 'antd';

/*
 0: {
          text: 'Registering',
          status: 'Warning',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="Online" />
          ),
          status: 'Success',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.abnormal" defaultMessage="Down" />
          ),
          status: 'Error',
        },
 */
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

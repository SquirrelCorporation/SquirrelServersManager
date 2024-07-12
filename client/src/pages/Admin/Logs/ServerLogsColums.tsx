import { InfoCircleFilled } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { Popover } from 'antd';
import JsonFormatter from 'react-json-formatter';
import { API } from 'ssm-shared-lib';

const jsonStyle = {
  propertyStyle: { color: '#3b6b87' },
  stringStyle: { color: '#538091' },
  numberStyle: { color: '#614b98' },
};

const ServerLogsColumns: ProColumns<API.ServerLog>[] = [
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
    valueType: 'dateTime',
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
    filters: true,
    onFilter: true,
    valueEnum: {
      10: { text: 'trace' },
      20: { text: 'debug' },
      30: { text: 'info', status: 'Default' },
      40: { text: 'warn', status: 'Warning' },
      50: { text: 'error', status: 'Error' },
      60: { text: 'fatal', status: 'Error' },
    },
  },
  {
    title: 'PID',
    dataIndex: 'pid',
    key: 'pid',
    filters: true,
    onFilter: true,
  },
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
    filters: true,
    onFilter: true,
  },
  {
    title: 'Message',
    dataIndex: 'msg',
    key: 'msg',
    filters: true,
    onFilter: true,
  },
  {
    title: 'Module ID',
    dataIndex: 'moduleId',
    key: 'moduleId',
    filters: true,
    onFilter: true,
  },
  {
    title: 'Req',
    dataIndex: 'req',
    key: 'req',
    hideInSearch: true,
    render: (text, record) => (
      <>
        {record.req && (
          <Popover
            content={
              <JsonFormatter
                json={record.req}
                tabWith={4}
                jsonStyle={jsonStyle}
              />
            }
          >
            <InfoCircleFilled />
          </Popover>
        )}
      </>
    ),
  },
  {
    title: 'Res',
    dataIndex: 'res',
    key: 'res',
    hideInSearch: true,
    render: (text, record) => (
      <>
        {record.res && (
          <Popover
            content={
              <JsonFormatter
                json={record.res}
                tabWith={4}
                jsonStyle={jsonStyle}
              />
            }
          >
            <InfoCircleFilled />
          </Popover>
        )}
      </>
    ),
  },
];

export default ServerLogsColumns;

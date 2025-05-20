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
    width: '10%',
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
    width: '10%',
  },
  {
    title: 'PID',
    dataIndex: 'pid',
    key: 'pid',
    filters: true,
    onFilter: true,
    width: '5%',
    responsive: ['sm'],
  },
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
    filters: true,
    onFilter: true,
    width: '10%',
  },
  {
    title: 'Message',
    dataIndex: 'msg',
    key: 'msg',
    ellipsis: true,
    filters: true,
    onFilter: true,
    responsive: ['sm'],
  },
  {
    title: 'Message',
    dataIndex: 'msg',
    key: 'msg',
    hideInSearch: true,
    responsive: ['xs'],
  },
  {
    title: 'Context',
    dataIndex: 'context',
    key: 'context',
    filters: true,
    onFilter: true,
    width: '10%',
  },
  {
    title: 'Req',
    dataIndex: 'req',
    key: 'req',
    hideInSearch: true,
    width: '10%',
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
    width: '10%',
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
  {
    title: 'Err',
    dataIndex: 'err',
    key: 'err',
    hideInSearch: true,
    width: '10%',
    render: (text, record) => (
      <>
        {record.err && (
          <Popover
            content={
              <JsonFormatter
                json={record.err}
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

import { ProColumns } from '@ant-design/pro-components';
import { API } from 'ssm-shared-lib';

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
  },
  {
    title: 'PID',
    dataIndex: 'pid',
    key: 'pid',
  },
  {
    title: 'Message',
    dataIndex: 'msg',
    key: 'msg',
  },
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
  },
];

export default ServerLogsColumns;

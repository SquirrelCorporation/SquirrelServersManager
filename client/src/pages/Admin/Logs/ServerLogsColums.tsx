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
    filters: true,
    onFilter: true,
  },
  {
    title: 'PID',
    dataIndex: 'pid',
    key: 'pid',
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
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
    filters: true,
    onFilter: true,
  },
];

export default ServerLogsColumns;

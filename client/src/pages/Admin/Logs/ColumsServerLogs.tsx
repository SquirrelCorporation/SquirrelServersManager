import { ProColumns } from '@ant-design/pro-components';

const ColumnsServerLogs: ProColumns<API.ServerLog>[] = [
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
];

export default ColumnsServerLogs;

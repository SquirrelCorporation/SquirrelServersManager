import { ProColumns } from '@ant-design/pro-components';
import { API } from 'ssm-shared-lib';

const TaskLogsColumns: ProColumns<API.Task>[] = [
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    valueType: 'dateTime',
  },
  {
    title: 'Identifier',
    dataIndex: 'ident',
    key: 'ident',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Command',
    dataIndex: 'cmd',
    key: 'cmd',
  },
];

export default TaskLogsColumns;

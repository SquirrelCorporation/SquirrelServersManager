import { ProColumns } from '@ant-design/pro-components';
import { API } from 'ssm-shared-lib';

const CronColumns: ProColumns<API.Cron>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Expression',
    dataIndex: 'expression',
    key: 'expression',
  },
  {
    title: 'Last Execution',
    dataIndex: 'lastExecution',
    key: 'lastExecution',
    valueType: 'dateTime',
  },
];

export default CronColumns;

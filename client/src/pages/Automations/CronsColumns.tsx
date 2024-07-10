import { GrommetIconsSystem } from '@/components/Icons/CustomIcons';
import { LockFilled } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { Avatar } from 'antd';
import { API } from 'ssm-shared-lib';

const CronColumns: ProColumns<API.Cron>[] = [
  {
    align: 'center',
    render: () => (
      <div style={{ width: '100%' }}>
        <Avatar
          style={{
            backgroundColor: '#3c3d3a',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
          icon={<GrommetIconsSystem />}
        />{' '}
        <LockFilled style={{ marginBottom: 0 }} />
      </div>
    ),
  },
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

import {
  Avatar,
  Card,
  Dropdown,
  FloatButton,
  Form,
  Input,
  List,
  MenuProps,
  Progress,
  Radio,
  Select,
} from 'antd';
import moment from 'moment';
import React, { memo } from 'react';

import {
  LoginOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ShakeOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import styles from './Inventory.less';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const SelectOption = Select.Option;
const { Search, TextArea } = Input;
declare const ProgressStatuses: readonly ['normal', 'exception', 'active', 'success'];

export type StateType = {
  visible?: boolean;
  done?: boolean;
  current?: ListItem;
};

export type ListItem = {
  id: string;
  owner?: string;
  title?: string;
  percent?: number;
  updatedAt?: Date;
  createdAt?: Date;
  description?: string;
  subDescription?: string;
  logo?: string;
  status?: (typeof ProgressStatuses)[number];
  href?: string;
};

const list: ListItem[] = [
  {
    id: '1',
    owner: 'test',
    title: 'test',
    percent: 1,
    updatedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2 * 1),
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2 * 1),
    description: 'test',
    subDescription: 'testtesttesttesttesttesttesttesttesttesttest',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
    status: 'active',
    href: 'https://ant.design',
  },
  {
    id: '2',
    owner: 'test',
    title: 'test',
    percent: 1,
    updatedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2 * 1),
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2 * 1),
    description: 'test',
    subDescription: 'testtesttesttesttesttesttest',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
    status: 'active',
    href: 'https://ant.design',
  },
];

const BasicList = memo(() => {
  const stateT: StateType = { visible: false, done: false };
  const [state, setState] = React.useState(stateT);

  const showModal = () => {
    setState({
      visible: true,
      current: undefined,
    });
  };

  const showEditModal = (item: ListItem) => {
    setState({
      visible: true,
      current: item,
    });
  };

  const deleteItem = (id) => {};

  //    const { visible, done, current = {} } = state;

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 5,
    total: 50,
  };
  // export const OsLogo : React.FC<OsLogoAttributes> = (logoAttributes) => {
  type ListItemPartial = {
    owner?: string;
    createdAt?: Date;
    status?: (typeof ProgressStatuses)[number];
    percent?: number;
  };
  const ListContent: React.FC<ListItemPartial> = (props: ListItemPartial) => (
    <div className={styles.listContent}>
      <div className={styles.listContentItem}>
        <span>Owner</span>
        <p>{props.owner}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>开始时间</span>
        <p>{moment(props.createdAt).format('YYYY-MM-DD HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <Progress
          percent={props.percent}
          status={props.status}
          strokeWidth={6}
          style={{ width: 180 }}
        />
      </div>
    </div>
  );
  const items: MenuProps['items'] = [
    {
      label: (
        <>
          <ReloadOutlined /> Reboot
        </>
      ),
      key: '0',
    },
    {
      label: (
        <>
          <LoginOutlined /> Connect
        </>
      ),
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <>
          <ShakeOutlined /> Ping
        </>
      ),
      key: '3',
    },
  ];
  const onClick: MenuProps['onClick'] = ({ key }) => {};
  const MoreBtn = (current: ListItem) => (
    <Dropdown menu={{ items, onClick }}>
      <a>更多</a>
    </Dropdown>
  );

  return (
    <PageContainer content={'test'}>
      <FloatButton icon={<QuestionCircleOutlined />} type="default" style={{ right: 94 }} />
      <div className={styles.standardList}>
        <Card
          className={styles.listCard}
          bordered={false}
          title="标准列表"
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '0 32px 40px 32px' }}
        >
          <List
            size="large"
            rowKey="id"
            loading={false}
            pagination={paginationProps}
            dataSource={list}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      showEditModal(item);
                    }}
                  >
                    编辑
                  </a>,
                  //<MoreBtn current={item} />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.logo} shape="square" size="large" />}
                  title={<a href={item.href}>{item.title}</a>}
                  description={item.subDescription}
                />
                <ListContent
                  owner={item.owner}
                  createdAt={item.createdAt}
                  status={item.status}
                  percent={item.percent}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </PageContainer>
  );
});

export default BasicList;

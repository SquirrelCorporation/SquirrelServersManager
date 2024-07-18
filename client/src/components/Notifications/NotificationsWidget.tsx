import {
  PajamasError,
  TdesignNotification,
} from '@/components/Icons/CustomIcons';
import { CloseOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Avatar, Badge, Popover, Typography } from 'antd';
import { ReactNode } from 'react';

const dataSource = [
  {
    title: 'Registry Gitea on error',
    avatar: (
      <PajamasError
        style={{
          color: 'red',
          fontSize: '20px',
        }}
      />
    ),
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'Ant Design',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: '蚂蚁金服体验科技',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
  {
    title: 'TechUI',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    subtitle:
      'Ant Design, a design language for background applications,\n' +
      '                      is refined by Ant UED Team',
  },
];

const NotificationsWidget = (props: any) => {
  return (
    <>
      <Popover
        content={
          <ProList<{
            title: string;
            avatar: string | ReactNode;
            subtitle: string;
          }>
            ghost={true}
            size={'small'}
            style={{
              width: '500px',
              maxHeight: '400px',
              overflowY: 'scroll',
            }}
            scroll={{ x: 40 }}
            split={true}
            toolBarRender={() => {
              return [
                <a key="3" type="primary">
                  Mark all as read
                </a>,
              ];
            }}
            metas={{
              title: {},
              description: {
                render: (_, row) => {
                  return (
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: '12px' }}
                      ellipsis={{ tooltip: row.subtitle }}
                    >
                      {row.subtitle}
                    </Typography.Text>
                  );
                },
              },
              avatar: {
                render: (_, row) => {
                  return (
                    <Avatar
                      shape={'square'}
                      size={'large'}
                      style={{ backgroundColor: 'black' }}
                      src={row.avatar}
                    />
                  );
                },
              },
              actions: {
                render: () => {
                  return [
                    <a key="read">
                      <CloseOutlined />
                    </a>,
                  ];
                },
              },
            }}
            rowKey="title"
            dataSource={dataSource}
          />
        }
      >
        <Badge count={3} offset={[0, 10]} color="rgb(45, 183, 245)">
          <Avatar
            style={{}}
            src={
              <TdesignNotification
                className={'svg-small-wiggle-anim'}
                style={{
                  color: 'rgba(255, 255, 255, 0.65)',
                  fontSize: '20px',
                }}
              />
            }
          />
        </Badge>
      </Popover>
    </>
  );
};

export default NotificationsWidget;

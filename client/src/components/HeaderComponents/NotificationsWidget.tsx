import {
  Nut,
  PajamasError,
  TdesignNotification,
} from '@/components/Icons/CustomIcons';
import {
  getAllNotifications,
  markAsAllSeen,
} from '@/services/rest/notifications';
import {
  CheckSquareOutlined,
  CloseOutlined,
  InfoCircleFilled,
  SmileOutlined,
} from '@ant-design/icons';
import { ActionType, ProList } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  ConfigProvider,
  Popover,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

const customizeRenderEmpty = () => (
  <div style={{ textAlign: 'center' }}>
    <Nut style={{ fontSize: 20 }} />
    <p>No notifications</p>
  </div>
);

const NotificationsWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const actionRef = useRef<ActionType | undefined>(null);
  const [notifications, setNotifications] = React.useState<
    API.InAppNotification[]
  >([]);

  const fetchNotifications = async () => {
    const response = await getAllNotifications();
    setNotifications(response.data);
  };

  React.useEffect(() => {
    void fetchNotifications();
  }, []);

  const handleMarkAllSeen = async () => {
    await markAsAllSeen();
    void fetchNotifications();
  };

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <>
      <ConfigProvider renderEmpty={customizeRenderEmpty}>
        <Popover
          open={open}
          trigger="click"
          onOpenChange={handleOpenChange}
          content={
            <ProList<API.InAppNotification>
              ghost={true}
              size={'small'}
              style={{
                marginTop: '-15px',
                width: '500px',
                maxHeight: '400px',
                overflowY: 'scroll',
              }}
              headerTitle="Notifications"
              actionRef={actionRef}
              scroll={{ x: 40 }}
              split={true}
              search={false}
              toolBarRender={() => {
                return [
                  <a key="1" type="primary" onClick={handleMarkAllSeen}>
                    <Tooltip title={'Mark all as read'}>
                      <CheckSquareOutlined />
                    </Tooltip>
                  </a>,
                  <a key="2" onClick={hide}>
                    <CloseOutlined />
                  </a>,
                ];
              }}
              metas={{
                title: { render: (Parent, row) => <>{row.module}</> },
                subTitle: {
                  render: (_, row) => {
                    return <Tag>{row.severity}</Tag>;
                  },
                },
                description: {
                  render: (_, row) => {
                    return (
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: '12px' }}
                        ellipsis={{ tooltip: row.message }}
                      >
                        {row.message} (
                        {moment(row.createdAt).format('YYYY-MM-DD, HH:mm')})
                      </Typography.Text>
                    );
                  },
                },
                avatar: {
                  render: (_, row) => {
                    switch (row.severity) {
                      case 'error':
                        return (
                          <>
                            <Avatar
                              shape={'square'}
                              size={'small'}
                              style={{ backgroundColor: '#FF6347' }}
                              src={<PajamasError />}
                            />
                          </>
                        );
                      case 'info':
                      case 'warning':
                      default:
                        return (
                          <Avatar
                            shape={'square'}
                            size={'large'}
                            style={{ backgroundColor: 'black' }}
                            src={
                              <InfoCircleFilled style={{ fontSize: '24px' }} />
                            }
                          />
                        );
                    }
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
              dataSource={notifications}
            />
          }
        >
          <Badge
            count={notifications?.filter((e) => !e.seen).length}
            offset={[0, 10]}
            color="rgb(45, 183, 245)"
          >
            <Avatar
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
      </ConfigProvider>
    </>
  );
};

export default NotificationsWidget;

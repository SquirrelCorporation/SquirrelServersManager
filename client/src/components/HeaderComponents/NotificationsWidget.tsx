import {
  Nut,
  PajamasError,
  TdesignNotification,
} from '@/components/Icons/CustomIcons';
import {
  getAllNotifications,
  markAsAllSeen,
} from '@/services/rest/notifications';
import { notificationSocket as socket } from '@/socket';
import {
  CheckSquareOutlined,
  CloseOutlined,
  InfoCircleFilled,
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API, SsmEvents } from 'ssm-shared-lib';

const customizeRenderEmpty = () => (
  <div style={{ textAlign: 'center' }}>
    <Nut style={{ fontSize: 20 }} />
    <p>No notifications</p>
  </div>
);

const fetchNotifications = async (
  setNotifications: React.Dispatch<
    React.SetStateAction<API.InAppNotification[]>
  >,
) => {
  const response = await getAllNotifications();
  setNotifications(response.data);
};

const handleMarkAllSeenAction = async (
  fetchNotificationsAsync: () => Promise<void>,
) => {
  await markAsAllSeen();
  void fetchNotificationsAsync();
};

const NotificationContent: React.FC<{
  actionRef: React.MutableRefObject<ActionType | undefined | null>;
  notifications: API.InAppNotification[];
  handleMarkAllSeen: () => void;
  hide: () => void;
}> = ({ actionRef, notifications, handleMarkAllSeen, hide }) => (
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
    toolBarRender={() => [
      <a key="1" type="primary" onClick={handleMarkAllSeen}>
        <Tooltip title={'Mark all as read'}>
          <CheckSquareOutlined />
        </Tooltip>
      </a>,
      <a key="2" onClick={hide}>
        <CloseOutlined />
      </a>,
    ]}
    metas={{
      title: { render: (Parent, row) => <>{row.module}</> },
      subTitle: {
        render: (_, row) => <Tag>{row.severity}</Tag>,
      },
      description: {
        render: (_, row) => (
          <Typography.Text
            type="secondary"
            style={{ fontSize: '12px' }}
            ellipsis={{ tooltip: row.message }}
          >
            {row.message} ({moment(row.createdAt).format('YYYY-MM-DD, HH:mm')})
          </Typography.Text>
        ),
      },
      avatar: {
        render: (_, row) => {
          switch (row.severity) {
            case 'error':
              return (
                <Avatar
                  shape={'square'}
                  size={'small'}
                  style={{ backgroundColor: '#FF6347' }}
                  src={<PajamasError />}
                />
              );
            case 'info':
            case 'warning':
            default:
              return (
                <Avatar
                  shape={'square'}
                  size={'large'}
                  style={{ backgroundColor: 'black' }}
                  src={<InfoCircleFilled style={{ fontSize: '24px' }} />}
                />
              );
          }
        },
      },
      actions: {
        render: () => [
          <a key="read">
            <CloseOutlined />
          </a>,
        ],
      },
    }}
    rowKey="title"
    dataSource={notifications}
  />
);

const NotificationsWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const actionRef = useRef<ActionType | undefined>(null);
  const [notifications, setNotifications] = useState<API.InAppNotification[]>(
    [],
  );

  const fetchNotifs = useCallback(
    () => fetchNotifications(setNotifications),
    [],
  );

  useEffect(() => {
    void fetchNotifs();
  }, [fetchNotifs]);

  const handleMarkAllSeenCallback = useCallback(
    () => handleMarkAllSeenAction(fetchNotifs),
    [fetchNotifs],
  );

  const hide = useCallback(() => setOpen(false), []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on(SsmEvents.Update.NOTIFICATION_CHANGE, fetchNotifs);

    return () => {
      socket.off(SsmEvents.Update.NOTIFICATION_CHANGE, fetchNotifs);
      socket.disconnect();
    };
  }, []);

  return (
    <ConfigProvider renderEmpty={customizeRenderEmpty}>
      <Popover
        open={open}
        trigger="click"
        onOpenChange={handleOpenChange}
        content={
          <NotificationContent
            actionRef={actionRef}
            notifications={notifications}
            handleMarkAllSeen={handleMarkAllSeenCallback}
            hide={hide}
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
  );
};

export default NotificationsWidget;

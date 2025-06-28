import React, { useEffect } from 'react';
import { notification } from 'antd';
import { useNotificationsStore } from '@app/store';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { notifications, removeNotification } = useNotificationsStore();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // Configure notification instance
    notification.config({
      placement: 'topRight',
      top: 50,
      duration: 0, // We'll manage duration ourselves
      maxCount: 3,
      rtl: false,
      prefixCls: 'ant-notification',
    });
  }, []);

  useEffect(() => {
    // Display new notifications
    notifications.forEach((notif) => {
      // Check if this notification is already displayed
      if (!notif.metadata?.displayed) {
        const notificationConfig = {
          key: notif.id,
          message: notif.title,
          description: notif.message,
          type: notif.type,
          duration: notif.duration ? notif.duration / 1000 : 0, // Convert to seconds
          onClose: () => removeNotification(notif.id),
          btn: notif.actions ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {notif.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={async () => {
                    await action.action();
                    removeNotification(notif.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    border: action.type === 'danger' ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                    background: action.type === 'primary' ? '#1890ff' : 'transparent',
                    color: action.type === 'primary' ? '#fff' : action.type === 'danger' ? '#ff4d4f' : '#000',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : undefined,
        };

        // Display the notification
        api[notif.type](notificationConfig);

        // Mark as displayed to prevent duplicates
        notif.metadata = { ...notif.metadata, displayed: true };
      }
    });
  }, [notifications, api, removeNotification]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};
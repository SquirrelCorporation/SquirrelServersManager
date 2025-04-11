import { notificationSocket as socket } from '@/socket';
import { notification, Typography } from 'antd';
import React, { useEffect } from 'react';
import { SsmAlert, SsmEvents } from 'ssm-shared-lib';

const AlertNotification: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (payload: any) => {
    if (payload?.severity === SsmAlert.AlertType.ERROR) {
      api.error({
        message: 'Alert',
        description: (
          <Typography.Text style={{ fontSize: 13 }}>
            {payload?.message
              ?.split('\n')
              .map((line: string, index: number) => <p key={index}>{line}</p>)}
          </Typography.Text>
        ),
        duration: 0,
      });
    }
    if (payload?.severity === SsmAlert.AlertType.SUCCESS) {
      api.success({
        message: 'Success',
        description: (
          <Typography.Text style={{ fontSize: 13 }}>
            {payload?.message
              ?.split('\n')
              .map((line: string, index: number) => <p key={index}>{line}</p>)}
          </Typography.Text>
        ),
        duration: 0,
      });
    }
  };
  useEffect(() => {
    socket.connect();
    socket.on(SsmEvents.Alert.NEW_ALERT, openNotificationWithIcon);

    return () => {
      socket.off(SsmEvents.Alert.NEW_ALERT, openNotificationWithIcon);
      socket.disconnect();
    };
  }, []);
  return <>{contextHolder}</>;
};

export default AlertNotification;

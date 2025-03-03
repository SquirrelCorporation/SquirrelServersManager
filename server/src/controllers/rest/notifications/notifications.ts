import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { Notification } from '../../../modules/notifications/notifications.module';

export const getAllNotifications = async (req, res) => {
  const notifications = await Notification.findAllNotSeen();
  new SuccessResponse('Got all notifications', notifications).send(res);
};

export const postAllSeen = async (req, res) => {
  await Notification.markAllSeen();
  new SuccessResponse('Updated all notifications to seen').send(res);
};

import InAppNotificationRepo from '../../../data/database/repository/InAppNotificationRepo';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getAllNotifications = async (req, res) => {
  const notifications = await InAppNotificationRepo.findAllNotSeen();
  new SuccessResponse('Got all notifications', notifications).send(res);
};

export const postAllSeen = async (req, res) => {
  await InAppNotificationRepo.markAllSeen();
  new SuccessResponse('Updated all notifications to seen').send(res);
};

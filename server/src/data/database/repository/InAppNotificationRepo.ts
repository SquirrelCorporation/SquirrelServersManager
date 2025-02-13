import InAppNotification, { InAppNotificationModel } from '../model/InAppNotification';

async function create(notification: InAppNotification): Promise<InAppNotification> {
  const created = await InAppNotificationModel.create(notification);
  return created.toObject();
}

async function findAllNotSeen(): Promise<InAppNotification[] | null> {
  return await InAppNotificationModel.find({ seen: false })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
    .exec();
}

async function countAllNotSeen(): Promise<number> {
  return await InAppNotificationModel.countDocuments({ seen: false }).lean().exec();
}

async function markAllSeen(): Promise<void> {
  await InAppNotificationModel.updateMany({ seen: false }, { seen: true }).lean().exec();
}

export default {
  create,
  findAllNotSeen,
  countAllNotSeen,
  markAllSeen,
};

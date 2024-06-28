import Notifications from './model.js';
import Users from '../users/model.js';
import { PENDING } from '../common/constants.js';

const sendNotification = async (smartEmail, transaction) => {
  const notification = await Notifications.create({ smartEmail, transaction });
  return notification;
};

const getNotifications = async (smartEmail) => {
  const notifications = await Notifications.find({
    smartEmail: smartEmail,
    state: PENDING,
  }).lean();

  return notifications;
};

export default { getNotifications, sendNotification };

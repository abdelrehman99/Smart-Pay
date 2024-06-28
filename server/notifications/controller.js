import service from './service.js';
import Users from '../users/model.js';
import logger from '../../config/logger.js';
import Notifications from './model.js';
import {
  ACCEPTED,
  DECLINED,
  PENDING,
  UNVALID_USER_MESSAGE,
} from '../common/constants.js';
import transactionService from '../transactions/service.js';
/**
 * @param {import('express').Request<{}, {}, showRequestBody, showRequestQuery>} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    const notifications = await service.getNotifications(user.smartEmail);

    logger.info(
      `[getNotifications] ${notifications.length} of ${user.smartEmail} is retrieved successfully.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Notifications is retrieved successfully!',
      data: notifications,
    });
  } catch (err) {
    logger.error(`[sendTransaction] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const confirmNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const sender = req.user;
    const { accept } = req.body;
    const state = accept ? ACCEPTED : DECLINED;

    const notification = await Notifications.findById(notificationId).lean();
    let transaction = null;

    console.log(notification);
    if (!notification || notification.state != PENDING) {
      res.status(500).json({
        status: 'failed',
        message: 'This notification does not exist!',
      });
    }

    if (accept)
    {
      console.log(notification.transaction.amount);
      if (sender?.balance < notification.transaction.amount) {
        res.status(401).json({
          status: 'failed',
          message: 'Insufficient funds please recharge wallet!',
        });
      }

      transaction = await transactionService.sendTransaction(
        notification.transaction.from,
        notification.transaction.to,
        notification.transaction.amount
      );
    }

    await Notifications.findByIdAndUpdate(notificationId, {
      state,
    });

    logger.info(
      `[transfer] ${amount} is sent successfully from ${sender.smartEmail} to ${smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Transaction is done successfully!',
      data: transaction,
    });
  } catch (err) {
    logger.error(`[transfer] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

export default { getNotifications, confirmNotification };

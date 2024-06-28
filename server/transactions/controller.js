import service from './service.js';
import Users from '../users/model.js';
import logger from '../../config/logger.js';
import { UNVALID_USER_MESSAGE } from '../common/constants.js';
import notificationsService from '../notifications/service.js';
/**
 * @param {import('express').Request<{}, {}, showRequestBody, showRequestQuery>} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

const sendTransaction = async (req, res, next) => {
  try {
    const sender = req.user;
    const { cardNumber, phone, smartEmail, amount } = req.body;

    const receiver = await Users.findOne({
      $or: [{ phone: phone }, { smartEmail: smartEmail }],
    }).lean();

    if (!receiver) {
      res.status(401).json({
        status: 'failed',
        message: "A receiver with these details don't exist",
      });
    }

    if (sender?.balance < amount) {
      res.status(401).json({
        status: 'failed',
        message: 'Insufficient funds please recharge wallet!',
      });
    }

    const transaction = await service.sendTransaction(
      sender.smartEmail,
      receiver.smartEmail,
      amount
    );

    logger.info(
      `[sendTransaction] ${amount} is sent successfully from ${sender.smartEmail} to ${receiver.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Transaction is done successfully!',
      data: transaction,
    });
  } catch (err) {
    logger.error(`[sendTransaction] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const receiveTransaction = async (req, res, next) => {
  try {
    const receiver = req.user;
    const { cardNumber, phone, smartEmail, amount } = req.body;

    const sender = await Users.findOne({
      $or: [{ phone: phone }, { smartEmail: smartEmail }],
    }).lean();

    if (!sender) {
      res.status(401).json({
        status: 'failed',
        message: UNVALID_USER_MESSAGE,
      });
    }

    const transaction = {
      from: sender.smartEmail,
      to: receiver.smartEmail,
      amount: amount,
    };

    await notificationsService.sendNotification(sender.smartEmail, transaction);

    logger.info(
      `[receiveTransaction] notification is sent successfully from ${receiver.smartEmail} to ${sender.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Notification is done successfully!',
    });
  } catch (err) {
    logger.error(`[receiveTransaction] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const transfer = async (req, res, next) => {
  try {
    const sender = req.user;
    const { smartEmail, amount } = req.body;

    if (sender?.balance < amount) {
      res.status(401).json({
        status: 'failed',
        message: 'Insufficient funds please recharge wallet!',
      });
    }

    const transaction = await service.sendTransaction(
      sender.smartEmail,
      smartEmail,
      amount
    );

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

const transactions = async (req, res, next) => {
  try {
    const user = req.user;
    const transactions = await service.getTransactions(user.smartEmail);

    logger.info(
      `[transactions] is returned successfully for ${user.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      data: transactions,
    });
  } catch (err) {
    logger.error(`[transactions] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

export default { sendTransaction, receiveTransaction, transfer, transactions };

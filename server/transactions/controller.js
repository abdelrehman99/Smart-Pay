import service from './service.js';
import Users from '../users/model.js';
import logger from '../../config/logger.js';
import {
  BUY_CRYPTO,
  CRYPTO_RATES,
  TRANSACTION,
  UNVALID_USER_MESSAGE,
} from '../common/constants.js';
import notificationsService from '../notifications/service.js';
import { IsSufficientCrypto, IsSufficientFunds } from './helper.js';
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

const rechargeOrDeposit = async (req, res, next) => {
  try {
    const user = req.user;
    const { cardId, amount, type } = req.body;
    const cardIdx = user?.cards?.findIndex((el) => {
      return el._id == cardId;
    });

    if (
      cardIdx == -1 ||
      !IsSufficientFunds(
        user?.balance,
        user?.cards[cardIdx]?.balance,
        type,
        amount
      )
    ) {
      throw new Error('Insufficient funds or this card does not exist!');
    }

    const transaction = await service.rechargeOrDepositTransaction(
      user,
      type,
      cardId,
      amount,
      cardIdx
    );

    logger.info(
      `[rechargeOrDeposit] ${amount} is ${type}ed successfully for ${user.smartEmail} regarding card ${cardId}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Transaction is done successfully!',
      data: transaction,
    });
  } catch (err) {
    logger.error(`[rechargeOrDeposit] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const buyOrSellCrypto = async (req, res, next) => {
  try {
    const user = req.user;
    const { crypto, cryptoAmount, type } = req.body;
    const cryptoBalance = user?.cryptoBalance ? user.cryptoBalance[crypto] : 0;

    if (
      !IsSufficientCrypto(
        user?.balance,
        crypto,
        cryptoBalance,
        type,
        cryptoAmount
      )
    ) {
      throw new Error('Insufficient funds!');
    }

    const transaction = await service.buyOrSellCryptoTransaction(
      user,
      type,
      crypto,
      cryptoAmount
    );

    logger.info(
      `[buyOrSellCrypto] ${cryptoAmount} is (${
        type == BUY_CRYPTO ? 'bought' : 'sold'
      }) successfully for ${user.smartEmail}`
    );
    res.status(200).json({
      status: 'success',
      message: 'Transaction is done successfully!',
      data: transaction,
    });
  } catch (err) {
    logger.error(`[buyOrSellCrypto] error occurred ${err}`);
    console.log(err);
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
      data: transactions.filter((el) => {
        return !el.type || el.type == TRANSACTION;
      }),
    });
  } catch (err) {
    logger.error(`[transactions] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const adminTransactions = async (req, res, next) => {
  try {
    const user = req.user;
    const transactions = await service.getAdminTransactions();

    logger.info(
      `[adminTransactions] is returned successfully for admin ${user.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      data: transactions.filter((el) => {
        return !el.type || el.type == TRANSACTION;
      }),
    });
  } catch (err) {
    logger.error(`[adminTransactions] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

export default {
  sendTransaction,
  receiveTransaction,
  transfer,
  transactions,
  rechargeOrDeposit,
  buyOrSellCrypto,
  adminTransactions,
};

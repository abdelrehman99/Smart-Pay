import service from './service.js';
import Users from '../users/model.js';
import logger from '../../config/logger.js';
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
        message: "Insufficient funds please recharge wallet!",
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

export default { sendTransaction };

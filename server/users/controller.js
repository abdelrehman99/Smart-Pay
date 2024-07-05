import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import logger from '../../config/logger.js';
import Users from './model.js';
import sendSms from '../common/smsService.js';
import { OTP_MESSAGE, CRYPTO_RATES } from '../common/constants.js';
import service from './service.js';

/**
 * @param {import('express').Request<{}, {}, showRequestBody, showRequestQuery>} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, phone, password, role, city, gender, birthDate, email } =
      req.body;

    const smartEmail = email?.split('@')[0] + '@smartpay.com';

    let user = await Users.create({
      name,
      phone,
      password,
      role,
      city,
      gender,
      birthDate,
      smartEmail,
    });

    const token = signToken(user._id);
    user.password = undefined;
    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  } catch (err) {
    logger.error(`[signup] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    let user = await Users.findOne({ phone }).select('+password');
    let isCorrectPassword = false;

    if (user) {
      isCorrectPassword = await bcrypt.compare(password, user?.password);
    }

    if (!isCorrectPassword) {
      res.status(500).json({
        status: 'failed',
        message: 'Wrong password or phone number',
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    logger.info(`[Login] user ${user.name} signed in successfully`);
    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  } catch (err) {
    logger.error(`[Login] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const generatePhoneOtp = async (req, res, next) => {
  try {
    const otpLength = 4;
    const { user, phoneOtp } = await service.generatePhoneOtp(
      req.user?._id,
      otpLength
    );

    const formattedPhone = `+2${user.phone}`;
    const message = OTP_MESSAGE + String(phoneOtp);

    // await sendSms(formattedPhone, message);

    logger.info(
      `[generatePhoneOtp] otp sent for ${formattedPhone}, is ${phoneOtp}`
    );
    res.status(200).json({
      status: 'success',
      message: 'Otp sent successfully!',
    });
  } catch (err) {
    logger.error(`[generatePhoneOtp] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = req.user;
    const formattedPhone = `+2${user.phone}`;
    const isValidOtp = await service.verifyPhoneOtp(otp, user);

    if (!isValidOtp) {
      throw new Error('Otp is wrong or expired!');
    }

    logger.info(
      `[verifyPhoneOtp] otp is verified successfully for ${formattedPhone}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Otp verified successfully!',
    });
  } catch (err) {
    logger.error(`[verifyPhoneOtp] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const getCards = async (req, res, next) => {
  try {
    const user = req.user;
    const cards = user?.cards;

    logger.info(
      `[getCards] ${cards?.length} is returned successfully for ${user.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Cards are returned successfully!',
      data: cards,
    });
  } catch (err) {
    logger.error(`[getCards] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const addCard = async (req, res, next) => {
  try {
    const { name, number } = req.body;
    const user = req.user;
    const card = {
      name: name.toUpperCase(),
      number: number,
    };

    const isAddedBefore = user?.cards?.find((el) => {
      return el.number == number;
    });

    if (isAddedBefore) {
      throw new Error('Card is added before!');
    }

    const newUser = await Users.findByIdAndUpdate(
      user._id,
      { $push: { cards: card } },
      { new: true }
    );

    const newCard = newUser.cards.find((el) => {
      return el.number == number;
    });

    logger.info(
      `[addCard] ${newCard} is added successfully for ${newUser.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Card is added successfully!',
      data: newCard,
    });
  } catch (err) {
    logger.error(`[addCard] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const { id: cardId } = req.params;
    const user = req.user;

    const isValidCard = user?.cards?.find((el) => {
      return el._id == cardId;
    });

    if (!isValidCard || !cardId) {
      throw new Error('This card does not exist!');
    }

    const newUser = await Users.findByIdAndUpdate(
      user._id,
      { $pull: { cards: { _id: cardId } } },
      { new: true }
    );

    logger.info(
      `[deleteCard] ${cardId} is deleted successfully for ${newUser.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      message: 'Card is deleted successfully!',
      data: newUser?.cards,
    });
  } catch (err) {
    logger.error(`[deleteCard] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const getCryptoBalance = async (req, res, next) => {
  try {
    const user = req.user;
    const cryptoBalance = Object.keys(user?.cryptoBalance).map((key) => {
      return {
        crypto: key,
        amount: user?.cryptoBalance[key],
        totalAmount: CRYPTO_RATES[key] * user?.cryptoBalance[key],
      };
    });

    logger.info(
      `[getCryptoBalance] is returned successfully for ${user.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      data: cryptoBalance,
    });
  } catch (err) {
    logger.error(`[getCryptoBalance] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const getBalance = async (req, res, next) => {
  try {
    const user = req.user;
    const balance = user?.balance;

    logger.info(
      `[getBalance] is returned successfully for ${user.smartEmail}.`
    );
    res.status(200).json({
      status: 'success',
      data: { balance },
    });
  } catch (err) {
    logger.error(`[getBalance] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

export default {
  signup,
  login,
  generatePhoneOtp,
  verifyPhoneOtp,
  addCard,
  deleteCard,
  getCards,
  getCryptoBalance,
  getBalance,
};

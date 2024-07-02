import Joi from 'joi';
import {
  BUY_CRYPTO,
  CRYPTO_CURRENCIES,
  RECHARGE,
  SELL_CRYPTO,
  WITHDRAW,
} from '../common/constants.js';

const sendSchema = {
  body: Joi.object({
    // cardNumber: Joi.string(),
    phone: Joi.string(),
    smartEmail: Joi.string(),
    amount: Joi.number().greater(0).required(),
  }).min(2),
};

const transferSchema = {
  body: Joi.object({
    smartEmail: Joi.string().required(),
    amount: Joi.number().greater(0).required(),
  }).required(),
};

const rechargeOrDepositSchema = {
  body: Joi.object({
    cardId: Joi.string().required(),
    amount: Joi.number().greater(0).required(),
    type: Joi.string().valid(RECHARGE, WITHDRAW).required(),
  }).required(),
};

const buyOrSellCryptoSchema = {
  body: Joi.object({
    crypto: Joi.string()
      .valid(...CRYPTO_CURRENCIES)
      .required(),
    cryptoAmount: Joi.number().greater(0).required(),
    type: Joi.string().valid(BUY_CRYPTO, SELL_CRYPTO).required(),
  }).required(),
};

export default {
  sendSchema,
  transferSchema,
  rechargeOrDepositSchema,
  buyOrSellCryptoSchema,
};

import express from 'express';
import controller from './controller.js';
import validator from '../common/validation.js';
import validationSchemas from './validationSchema.js';
import authController from '../auth/controller.js';
const router = express.Router();

router.get('/', authController.authenticate, controller.transactions);
router.get(
  '/cryptoTransactions',
  authController.authenticate,
  controller.cryptoTransactions
);
router.get(
  '/adminTransactions',
  authController.authenticate,
  controller.adminTransactions
);

router.post(
  '/send',
  authController.authenticate,
  validator(validationSchemas.sendSchema),
  controller.sendTransaction
);

router.post(
  '/receive',
  authController.authenticate,
  validator(validationSchemas.sendSchema),
  controller.receiveTransaction
);

router.post(
  '/transfer',
  authController.authenticate,
  validator(validationSchemas.transferSchema),
  controller.transfer
);

router.post(
  '/rechargeOrDeposit',
  authController.authenticate,
  validator(validationSchemas.rechargeOrDepositSchema),
  controller.rechargeOrDeposit
);

router.post(
  '/buyOrSellCrypto',
  authController.authenticate,
  validator(validationSchemas.buyOrSellCryptoSchema),
  controller.buyOrSellCrypto
);

// router.get('/stats', authController.authenticate, userController.stats);

export default router;

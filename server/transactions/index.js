import express from 'express';
import controller from './controller.js';
import validator from '../common/validation.js';
import validationSchemas from './validationSchema.js';
import authController from '../auth/controller.js';
const router = express.Router();

router.get('/', authController.authenticate, controller.transactions);

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

// router.get('/stats', authController.authenticate, userController.stats);

export default router;

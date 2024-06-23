import express from 'express';
import controller from './controller.js';
import validator from '../common/validation.js';
import validationSchemas from './validationSchema.js';
import authController from '../auth/controller.js';
const router = express.Router();

router.post(
  '/send',
  authController.authenticate,
  validator(validationSchemas.sendSchema),
  controller.sendTransaction
);

// router.get('/stats', authController.authenticate, userController.stats);

export default router;

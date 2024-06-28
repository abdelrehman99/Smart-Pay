import express from 'express';
import controller from './controller.js';
import validator from '../common/validation.js';
import validationSchemas from './validationSchema.js';
import authController from '../auth/controller.js';
const router = express.Router();

router.get('/', authController.authenticate, controller.getNotifications);

router.post(
  '/confirmNotification/:id',
  authController.authenticate,
  validator(validationSchemas.confirmNotification),
  controller.confirmNotification
);


// router.get('/stats', authController.authenticate, userController.stats);

export default router;

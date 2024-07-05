import express from 'express';
import userController from './controller.js';
import validator from '../common/validation.js';
import validationSchemas from './validationSchema.js';
import authController from '../auth/controller.js';
const userRouter = express.Router();

userRouter.post(
  '/signup',
  validator(validationSchemas.signupSchema),
  userController.signup
);

userRouter.post(
  '/login',
  validator(validationSchemas.loginSchema),
  userController.login
);

userRouter.get(
  '/generatePhoneOtp',
  authController.authenticate,
  userController.generatePhoneOtp
);

userRouter.post(
  '/verifyPhoneOtp',
  authController.authenticate,
  userController.verifyPhoneOtp
);

userRouter.post(
  '/cards',
  authController.authenticate,
  validator(validationSchemas.addCardSchema),
  userController.addCard
);

userRouter.delete(
  '/cards/:id',
  authController.authenticate,
  userController.deleteCard
);

userRouter.get(
  '/crypto',
  authController.authenticate,
  userController.getCryptoBalance
);

userRouter.get(
  '/balance',
  authController.authenticate,
  userController.getBalance
);

userRouter.get('/cards', authController.authenticate, userController.getCards);

// userRouter.get('/stats', authController.authenticate, userController.stats);

export default userRouter;

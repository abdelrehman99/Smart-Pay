import express from 'express';
import userController from './controller.js';
import validator from '../common/validation.js';
import validationSchemas from './validationSchema.js';
// import authController from '../auth/controller.js';
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

// userRouter.get('/stats', authController.authenticate, userController.stats);

export default userRouter;

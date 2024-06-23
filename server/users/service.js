import crypto from 'crypto';
import Users from './model.js';
import logger from '../../config/logger.js';

const generatePhoneOtp = async (userId, otpLength) => {
  const phoneOtp = 1234;
  const user = await Users.findByIdAndUpdate(userId, { phoneOtp });
  const otpTimerMs = 1 * 60 * 1000;
  const formattedPhone = `+2${user.phone}`;

  setTimeout(async () => {
    try {
      await Users.findByIdAndUpdate(userId, { $unset: { phoneOtp: 1 } });
      const now = new Date();
      logger.info(
        `[generatePhoneOtp] otp sent for ${formattedPhone}, with code ${phoneOtp} expired at ${now}`
      );
    } catch (err) {
      throw new Error();
    }
  }, otpTimerMs);

  return { user, phoneOtp };
};

const verifyPhoneOtp = async (requestOtp, user) => {
  const userOtp = user?.phoneOtp;

  if (!userOtp || userOtp != requestOtp) {
    return false;
  }

  await Users.findByIdAndUpdate(user?._id, {
    $unset: { phoneOtp: 1 },
    $set: { isPhoneVerified: true },
  });

  return true;
};

export default { generatePhoneOtp, verifyPhoneOtp };

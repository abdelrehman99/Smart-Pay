import Users from '../users/model.js';
import jwt from 'jsonwebtoken';
import logger from '../../config/logger.js';
/**
 * @param {import('express').Request<{}, {}, showRequestBody, showRequestQuery>} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    let token = null;
    if (header && header.startsWith('Bearer')) {
      token = header.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'failed',
        message: 'Invalid token!',
      });
    }

    new Promise((resolve, reject) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return resolve(decoded);
    }).then(async (decoded) => {
      const CurrentUser = await Users.findById(decoded.id).lean();

      if (!CurrentUser)
        if (!token) {
          res.status(401).json({
            status: 'failed',
            message: 'This user no longer exists',
          });
        }

      req.user = CurrentUser;
      next();
    });
  } catch (err) {
    console.log(err);

    logger.error(`[authenticate] error occurred ${err}`);

    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

export default { authenticate };

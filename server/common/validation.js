import logger from '../../config/logger.js';

const validator = (schemas) => {
  return async (req, res, next) => {
    try {
      await Promise.all([
        schemas.query &&
          schemas.query.validateAsync(req.query, { abortEarly: true }),
        schemas.body &&
          schemas.body.validateAsync(req.body, { abortEarly: false }),
        schemas.params &&
          schemas.params.validateAsync(req.params, { abortEarly: true }),
      ]);

      if (schemas.query)
        req.query = await schemas.query.validateAsync(req.query);
      if (schemas.body) req.body = await schemas.body.validateAsync(req.body);

      next();
    } catch (error) {
      logger.error(`[Validation Error]: ${error.message}`);
      res.status(400).json({
        status: 'failed',
        error: 'validation error',
        message: formatJoiMessages(error),
      });
    }
  };
};

function formatJoiMessages(error) {
  const formattedErrors = {};

  error.details.forEach((detail) => {
    formattedErrors[detail.path.join('.')] = detail.message;
  });

  return formattedErrors;
}

export default validator;

import Joi from 'joi';

const confirmNotification = {
  body: Joi.object({
    accept: Joi.boolean().required(),
  }).required(),
};

export default { confirmNotification };

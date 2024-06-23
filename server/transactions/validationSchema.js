import Joi from 'joi';

const sendSchema = {
  body: Joi.object({
    // cardNumber: Joi.string(),
    phone: Joi.string(),
    smartEmail: Joi.string(),
    amount: Joi.number().greater(0).required()
  }).min(2),
};

export default { sendSchema };

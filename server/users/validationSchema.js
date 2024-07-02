import Joi from 'joi';
import { ROLES } from '../common/constants.js';

const signupSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string()
      .required()
      .regex(/^((012)|(011)|(010))([0-9]){8}$/, {
        name: 'Invalid phone format',
      }),
    role: Joi.string().valid(...ROLES),
    email: Joi.string()
      .required()
      .email({ tlds: { allow: false } }),
    birthDate: Joi.string().required(),
    gender: Joi.string().required(),
    city: Joi.string().required(),
    password: Joi.string()
      .required()
      .regex(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*(\W|_)).{8})/, {
        name: '(at least 8 characters, upper case, lower case, numbers and special characters)',
      }),
  }).required(),
};

const loginSchema = {
  body: Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required(),
  }).required(),
};

const addCardSchema = {
  body: Joi.object({
    name: Joi.string()
      .regex(/\w\s\w/, {
        name: 'Invalid card name, card name must contain two names',
      })
      .required(),
    number: Joi.string().length(16).required(),
  }).required(),
};

export default { signupSchema, loginSchema, addCardSchema };

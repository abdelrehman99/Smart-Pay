import dotenv from 'dotenv';

const config = dotenv.config({
  path: 'config.env',
});

export default { config };

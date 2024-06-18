import mongoose from 'mongoose';
import config from '../config/index.js';
import app from './app.js';

const DB = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log('DB not connected', err));

app.listen(3000, () => {
  console.log('App is running on port 3000');
});

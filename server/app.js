import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './users/index.js';
import transactionsRouter from './transactions/index.js'

const app = new express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/health', (req, res, next) => {
  console.log('Alive al 7amd allah');
  res.status(200).json({
    status: 'success',
    message: 'Working fine bruv',
  });
});

app.use('/api/v0/users', userRouter);
app.use('/api/v0/transactions', transactionsRouter);

export default app;
